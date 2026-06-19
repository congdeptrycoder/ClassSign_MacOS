import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../../../src/application/use-cases/LoginUseCase';
import { IAccountRepository } from '../../../../src/domain/repositories/IAccountRepository';
import { Account } from '../../../../src/domain/entities/Account';

describe('LoginUseCase Unit Tests', () => {
  let loginUseCase: LoginUseCase;
  let mockAccountRepository: IAccountRepository;

  beforeEach(() => {
    mockAccountRepository = {
      login: vi.fn(),
    };
    loginUseCase = new LoginUseCase(mockAccountRepository);
  });

  it('should throw error when username is empty', async () => {
    await expect(loginUseCase.execute('', 'password')).rejects.toThrow(
      'Vui lòng nhập tài khoản và mật khẩu.'
    );
  });

  it('should throw error when password is empty', async () => {
    await expect(loginUseCase.execute('username', '')).rejects.toThrow(
      'Vui lòng nhập tài khoản và mật khẩu.'
    );
  });

  it('should return account when credentials are valid', async () => {
    const mockAccount = new Account(1, 'user', 'Name', 'student', '123', 1);
    (mockAccountRepository.login as any).mockResolvedValue(mockAccount);

    const result = await loginUseCase.execute('user', 'pass');
    expect(result).toBe(mockAccount);
    expect(mockAccountRepository.login).toHaveBeenCalledWith('user', 'pass');
  });

  it('should throw error when repository returns null', async () => {
    (mockAccountRepository.login as any).mockResolvedValue(null);

    await expect(loginUseCase.execute('user', 'pass')).rejects.toThrow(
      'Sai tài khoản hoặc mật khẩu.'
    );
    expect(mockAccountRepository.login).toHaveBeenCalledWith('user', 'pass');
  });
});
