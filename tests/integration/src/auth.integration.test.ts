import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../../src/application/use-cases/LoginUseCase';
import { AccountRepositoryImpl } from '../../../src/infrastructure/repositories/AccountRepositoryImpl';
import { apiClient } from '../../../src/infrastructure/api/apiClient';

vi.mock('../../../src/infrastructure/api/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
    }
}));

describe('Auth Frontend Integration Tests (UseCase + Repository)', () => {
    let loginUseCase: LoginUseCase;
    let accountRepository: AccountRepositoryImpl;

    beforeEach(() => {
        vi.clearAllMocks();
        accountRepository = new AccountRepositoryImpl();
        loginUseCase = new LoginUseCase(accountRepository);
    });

    it('should successfully login and return Account entity', async () => {
        const mockResponse = {
            user: {
                id: 1,
                username: 'teststudent',
                name: 'Test Student',
                role: 'student',
                id_card: '123456789',
                status: 'study'
            }
        };

        // Mock the apiClient.post to resolve with the mock data
        (apiClient.post as any).mockResolvedValue(mockResponse);

        const account = await loginUseCase.execute('teststudent', 'password123');

        expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
            username: 'teststudent',
            password: 'password123'
        });

        // Validate the returned Entity
        expect(account.id).toBe(1);
        expect(account.username).toBe('teststudent');
        expect(account.name).toBe('Test Student');
        expect(account.role).toBe('student');
    });

    it('should throw error when apiClient fails', async () => {
        (apiClient.post as any).mockRejectedValue(new Error('Network error'));

        await expect(loginUseCase.execute('wronguser', 'wrongpass')).rejects.toThrow('Network error');
    });

    it('should throw error when username or password is missing', async () => {
        await expect(loginUseCase.execute('', 'password')).rejects.toThrow('Vui lòng nhập tài khoản và mật khẩu.');
        await expect(loginUseCase.execute('username', '')).rejects.toThrow('Vui lòng nhập tài khoản và mật khẩu.');
    });
});
