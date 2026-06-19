/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useLoginViewModel } from '../../../../src/interface-adapters/viewmodels/Login/useLoginViewModel';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as reactRouterDom from 'react-router-dom';

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

// Mock the DI container and use cases
const mockExecute = vi.fn();

vi.mock('../../../../src/di/auth.di', () => ({
    loginUseCase: {
        execute: (...args: any[]) => mockExecute(...args)
    },
    loginController: {
        login: (...args: any[]) => mockExecute(...args)
    }
}));

describe('useLoginViewModel', () => {
    let mockNavigate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate = vi.fn();
        (reactRouterDom.useNavigate as any).mockReturnValue(mockNavigate);
        
        // Mock localStorage
        Storage.prototype.setItem = vi.fn();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useLoginViewModel());
        expect(result.current.password).toBe('');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.notification).toBeNull();
    });

    it('should update password', () => {
        const { result } = renderHook(() => useLoginViewModel());
        
        act(() => {
            result.current.setPassword('password');
        });

        expect(result.current.password).toBe('password');
    });

    it('should handle successful login and run timeouts', async () => {
        mockExecute.mockResolvedValue({ success: true, account: { id: 1, role: 'student', name: 'Test' } });
        
        const mockOnLoginSuccess = vi.fn();
        const { result } = renderHook(() => useLoginViewModel(mockOnLoginSuccess));
        
        act(() => {
            result.current.setPassword('password');
        });

        await act(async () => {
            result.current.handleLogin('testuser');
        });

        expect(mockExecute).toHaveBeenCalledWith('testuser', 'password');
        
        // Fast forward 300ms
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(result.current.passwordStatus).toBe('success');

        // Fast forward another 500ms (total 800ms)
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(mockOnLoginSuccess).toHaveBeenCalledWith({ id: 1, role: 'student', name: 'Test' });
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle login error with fallback message', async () => {
        mockExecute.mockResolvedValue({ success: false });
        
        const { result } = renderHook(() => useLoginViewModel());
        
        await act(async () => {
            await result.current.handleLogin('wronguser');
        });

        expect(result.current.notification).toBe('Sai thông tin đăng nhập.');
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle login error', async () => {
        mockExecute.mockResolvedValue({ success: false, message: 'Invalid credentials' });
        
        const { result } = renderHook(() => useLoginViewModel());
        
        act(() => {
            result.current.setPassword('wrongpass');
        });

        await act(async () => {
            await result.current.handleLogin('wronguser');
        });

        expect(result.current.notification).toBe('Invalid credentials');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.usernameStatus).toBe('error');
        expect(result.current.passwordStatus).toBe('error');
    });
});
