export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
    background: string;
    surface: string;
    navBar: string;
    text: string;
    textSecondary: string;
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    tableHeader: string;
    tableBorder: string;
    tableHeaderText: string;
    tableCell: string;
    inputBackground: string;
    inputText: string;
    inputBorder: string;
    card: string;
    cardText: string;
    link: string;
    separator: string;
    searchSection: string;
    searchButton: string;
    modalBackground: string;
    loginGradient: [string, string];
    themeToggleBackground: string;
    themeToggleText: string;
    statusSuccess: string;
    statusDanger: string;
    statusWarning: string;
    statusInfo: string;
    btnDetail: string;
    btnEdit: string;
    btnDelete: string;
    btnCancel: string;
    warningText: string;
}

export interface ThemeContextValue {
    theme: ThemeMode;
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
}
