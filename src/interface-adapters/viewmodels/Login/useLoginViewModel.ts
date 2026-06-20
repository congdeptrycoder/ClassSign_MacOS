import { useState } from 'react';
import { loginController } from '../../../di/auth.di';
import { Account } from '../../../domain/entities/Account';

export const useLoginViewModel = (onLoginSuccess?: (account: Account) => void) => {
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

        try {
            const account = await loginController.login(currentUsername, password);
            setUsernameStatus('success');

            setTimeout(() => {
                setPasswordStatus('success');
            }, 300);

            setTimeout(() => {
                onLoginSuccess?.(account);
            }, 800);
        } catch (error: any) {
            setNotification(error.message || 'Sai thông tin đăng nhập.');
            setUsernameStatus('error');
            setPasswordStatus('error');
        } finally {
            setIsLoading(false);
        }
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
