import { useState } from 'react';

export const useLoginViewModel = (onLoginSuccess?: (role: string) => void) => {
    const [password, setPassword] = useState('');

    const handleLogin = (currentUsername: string) => {
        if (currentUsername === 'admin' && password === '1') {
            onLoginSuccess?.('admin');
            return;
        }

        if (currentUsername === 'user' && password === '1') {
            onLoginSuccess?.('student');
            return;
        }

        console.log('Login attempt with:', {
            username: currentUsername,
            password,
        });
        
        // In web/electron, we might use a standard alert for simple errors
        if (currentUsername && password) {
             window.alert('Sai tên đăng nhập hoặc mật khẩu!');
        }
    };

    return {
        password,
        setPassword,
        handleLogin,
    };
};
