import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account';

export class LoginUseCase {
    private accountRepository: IAccountRepository;

    constructor(accountRepository: IAccountRepository) {
        this.accountRepository = accountRepository;
    }

    async execute(username: string, password: string): Promise<Account> {
        if (!username || !password) {
            throw new Error('Vui lòng nhập tài khoản và mật khẩu.');
        }

        const account = await this.accountRepository.login(username, password);
        if (!account) {
            throw new Error('Sai tài khoản hoặc mật khẩu.');
        }

        return account;
    }
}
