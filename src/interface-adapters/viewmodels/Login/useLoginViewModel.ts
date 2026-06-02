import { useState } from 'react';
import { AccountRepositoryImpl } from '../../../infrastructure/repositories/AccountRepositoryImpl';
import { LoginUseCase } from '../../../application/use-cases/LoginUseCase';
import { LoginController } from '../../controllers/LoginController';

export const useLoginViewModel = (onLoginSuccess?: (role: string) => void) => {
    const [password, setPassword] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'default' | 'success' | 'error'>('default');
    const [passwordStatus, setPasswordStatus] = useState<'default' | 'success' | 'error'>('default');
    const [notification, setNotification] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (currentUsername: string) => {
        setIsLoading(true);
        // Reset states
        setUsernameStatus('default');
        setPasswordStatus('default');
        setNotification(null);

        const repository = new AccountRepositoryImpl();
        const useCase = new LoginUseCase(repository);
        const controller = new LoginController(useCase);

        const result = await controller.login(currentUsername, password);

        if (result.success && result.account) {
            const userRole = result.account.role;

            setUsernameStatus('success');

            setTimeout(() => {
                setPasswordStatus('success');
            }, 300);

            setTimeout(() => {
                onLoginSuccess?.(userRole);
            }, 800);

        } else {
            setNotification(result.message || 'Sai thông tin đăng nhập.');

            setUsernameStatus('error');
            setPasswordStatus('error');
        }
        setIsLoading(false);
    };

    return {
        password,
        setPassword,
        handleLogin,
        usernameStatus,
        passwordStatus,
        notification,
        isLoading
    };
};
