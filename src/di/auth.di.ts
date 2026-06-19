import { AccountRepositoryImpl } from '../infrastructure/repositories/AccountRepositoryImpl';
import { IAccountRepository } from '../domain/repositories/IAccountRepository';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { LoginController } from '../interface-adapters/controllers/LoginController';

// 1. Instantiate Repository (Infrastructure Layer)
const accountRepository: IAccountRepository = new AccountRepositoryImpl();

// 2. Instantiate Use Case (Application Layer)
const loginUseCase = new LoginUseCase(accountRepository);

// 3. Instantiate Controller (Interface Adapters Layer)
export const loginController = new LoginController(loginUseCase);
