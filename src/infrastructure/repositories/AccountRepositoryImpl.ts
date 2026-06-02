import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account';

export class AccountRepositoryImpl implements IAccountRepository {
    async login(username: string, password: string): Promise<Account | null> {
        try {
            const response = await fetch('http://localhost:3002/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Đăng nhập thất bại.');
            }

            const data = await response.json();
            return new Account(data.id, data.username, data.name, data.role, data.id_card);
        } catch (error: any) {
            console.error('AccountRepositoryImpl login error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }
}
