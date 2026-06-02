import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginViewModel } from '../../../interface-adapters/viewmodels/Login/useLoginViewModel';
import { useTheme } from '../../components/ThemeContext';
import hustLogo from '../../../../public/images/hust-logo.png';
import './LoginScreen.css';

export const LoginScreen = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [usernameInput, setUsernameInput] = useState('');

    const onLoginSuccess = (role: string) => {
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/student');
        }
    };

    const { 
        password, 
        setPassword, 
        handleLogin, 
        usernameStatus, 
        passwordStatus, 
        notification, 
        isLoading 
    } = useLoginViewModel(onLoginSuccess);

    const handlePressLogin = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(usernameInput);
    };

    const getStatusClass = (status: 'default' | 'success' | 'error') => {
        if (status === 'success') return 'input-success';
        if (status === 'error') return 'input-error';
        return '';
    };

    return (
        <div className="login-container">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
                <span className="icon">{isDark ? '☀️' : '🌙'}</span>
                <span className="text">{isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
            </button>

            <div className="login-card card">
                <div className="logo-container">
                    <img src={hustLogo} alt="HUST Logo" className="logo" />
                </div>
                <h1 className="title">ĐẠI HỌC BÁCH KHOA HÀ NỘI</h1>
                <p className="description">Hệ thống đăng ký học tập tiện lợi</p>

                {notification && (
                    <div className="login-notification">
                        {notification}
                    </div>
                )}

                <form onSubmit={handlePressLogin} className="login-form">
                    <input
                        type="text"
                        placeholder="Tài khoản"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        autoCapitalize="none"
                        className={`input-field ${getStatusClass(usernameStatus)}`}
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`input-field ${getStatusClass(passwordStatus)}`}
                    />
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};
