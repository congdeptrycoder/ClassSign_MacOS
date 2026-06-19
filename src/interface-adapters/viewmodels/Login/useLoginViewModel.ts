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

        const result = await loginController.login(currentUsername, password);

        if (result.success && result.account) {
            setUsernameStatus('success');

            setTimeout(() => {
                setPasswordStatus('success');
            }, 300);

            setTimeout(() => {
                onLoginSuccess?.(result.account);
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
