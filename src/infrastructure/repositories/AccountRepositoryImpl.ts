import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account';
import { apiClient } from '../api/apiClient';

interface LoginResponseData {
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
    id_card: string;
    status: string;
  };
}

export class AccountRepositoryImpl implements IAccountRepository {
  async login(username: string, password: string): Promise<Account | null> {
    try {
      const { user } = await apiClient.post<LoginResponseData>('/auth/login', {
        username,
        password,
      });

      return new Account(
        user.id,
        user.username,
        user.name,
        user.role,
        user.id_card,
        user.status
      );
    } catch (error: any) {
      console.error('AccountRepositoryImpl login error:', error);
      throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
    }
  }
}
