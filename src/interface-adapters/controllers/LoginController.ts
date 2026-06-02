import { LoginUseCase } from '../../application/use-cases/LoginUseCase';

export class LoginController {
    private loginUseCase: LoginUseCase;

    constructor(loginUseCase: LoginUseCase) {
        this.loginUseCase = loginUseCase;
    }

    async login(username: string, password: string) {
        try {
            const account = await this.loginUseCase.execute(username, password);
            return {
                success: true,
                account,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
