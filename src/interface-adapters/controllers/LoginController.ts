import { LoginUseCase } from '../../application/use-cases/LoginUseCase';

export class LoginController {
    constructor(private readonly loginUseCase: LoginUseCase) {}

    async login(username: string, password: string) {
        return this.loginUseCase.execute(username, password);
    }
}
