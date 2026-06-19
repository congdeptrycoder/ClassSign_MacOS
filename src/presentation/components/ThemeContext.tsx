import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeColors, ThemeContextValue, ThemeMode } from '../../shared/types/theme.types';

export const lightColors: ThemeColors = {
    background: '#FFFFFF',
    surface: '#F8F8F8',
    navBar: '#CC0000',
    text: '#333333',
    textSecondary: '#666666',
    buttonPrimary: '#8B0000',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#FFD700',
    buttonSecondaryText: '#8B0000',
    tableHeader: '#F0F0F0',
    tableBorder: '#EEEEEE',
    tableHeaderText: '#555555',
    tableCell: '#333333',
    inputBackground: 'rgba(255, 255, 255, 0.9)',
    inputText: '#333333',
    inputBorder: '#DDDDDD',
    card: '#FFFFFF',
    cardText: '#333333',
    link: '#0275d8',
    separator: '#EEEEEE',
    searchSection: '#F9F9F9',
    searchButton: '#8B0000',
    modalBackground: '#FFFFFF',
    loginGradient: ['#8B0000', '#FF4D4D'],
    themeToggleBackground: 'rgba(255,255,255,0.25)',
    themeToggleText: '#FFFFFF',
    statusSuccess: '#4caf50',
    statusDanger: '#f44336',
    statusWarning: '#ff9800',
    statusInfo: '#2196F3',
    btnDetail: '#337ab7',
    btnEdit: '#f0ad4e',
    btnDelete: '#d9534f',
    btnCancel: '#aaaaaa',
    warningText: '#83b13e',
};

export const darkColors: ThemeColors = {
    background: '#1a1a2e',
    surface: '#16213e',
    navBar: '#0f3460',
    text: '#E0E0E0',
    textSecondary: '#AAAAAA',
    buttonPrimary: '#e94560',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#f5a623',
    buttonSecondaryText: '#1a1a2e',
    tableHeader: '#1a2a4a',
    tableBorder: '#2a3a5a',
    tableHeaderText: '#CCCCCC',
    tableCell: '#E0E0E0',
    inputBackground: 'rgba(255, 255, 255, 0.08)',
    inputText: '#E0E0E0',
    inputBorder: '#2a3a5a',
    card: '#16213e',
    cardText: '#E0E0E0',
    link: '#64B5F6',
    separator: '#2a3a5a',
    searchSection: '#16213e',
    searchButton: '#e94560',
    modalBackground: '#1a2a4a',
    loginGradient: ['#1a1a2e', '#0f3460'],
    themeToggleBackground: 'rgba(255,255,255,0.15)',
    themeToggleText: '#FFD700',
    statusSuccess: '#81c784',
    statusDanger: '#e57373',
    statusWarning: '#ffb74d',
    statusInfo: '#64b5f6',
    btnDetail: '#5bc0de',
    btnEdit: '#f0ad4e',
    btnDelete: '#d9534f',
    btnCancel: '#777777',
    warningText: '#aed581',
};

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    isDark: false,
    colors: lightColors,
    toggleTheme: () => {},
});

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<ThemeMode>('light');

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const value = useMemo<ThemeContextValue>(() => {
        const isDark = theme === 'dark';
        return {
            theme,
            isDark,
            colors: isDark ? darkColors : lightColors,
            toggleTheme,
        };
    }, [theme, toggleTheme]);

    // Apply theme colors to CSS variables for easy use in Vanilla CSS
    useEffect(() => {
        const root = document.documentElement;
        const colors = isDark ? darkColors : lightColors;
        
        Object.entries(colors).forEach(([key, val]) => {
            if (Array.isArray(val)) {
                root.style.setProperty(`--${key}-start`, val[0]);
                root.style.setProperty(`--${key}-end`, val[1]);
            } else {
                root.style.setProperty(`--${key}`, val as string);
            }
        });
        
        root.setAttribute('data-theme', theme);
    }, [theme, value.isDark]);

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
