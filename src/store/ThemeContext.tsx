import { createContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  cardSecondary: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const lightThemeColors: ThemeColors = {
  primary: '#007aff',
  background: '#ffffff',
  card: '#ffffff',
  cardSecondary: '#f8fafc',
  surface: '#fafcff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  accent: '#eff6ff',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626'
};

export const darkThemeColors: ThemeColors = {
  primary: '#007aff',
  background: '#090d16',
  card: '#111827',
  cardSecondary: '#0f172a',
  surface: '#0d1322',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#1e293b',
  borderSubtle: '#172033',
  accent: '#1e293b',
  success: '#22c55e',
  warning: '#fbbf24',
  danger: '#ef4444'
};

export const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'light',
  isDark: false,
  colors: lightThemeColors,
  toggleTheme: () => {},
  setThemeMode: () => {}
});
