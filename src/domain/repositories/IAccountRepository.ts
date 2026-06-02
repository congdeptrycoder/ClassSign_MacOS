import { Account } from '../entities/Account';

export interface IAccountRepository {
    login(username: string, password: string): Promise<Account | null>;
}
