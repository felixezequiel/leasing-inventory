import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme, AppTheme } from './theme';

type ThemeContextType = {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  // Determina o tema atual com base no modo selecionado
  const resolveTheme = (): AppTheme => {
    if (themeMode === 'system') {
      return colorScheme === 'dark' ? DarkTheme : LightTheme;
    }
    return themeMode === 'dark' ? DarkTheme : LightTheme;
  };

  const [theme, setThemeState] = useState<AppTheme>(resolveTheme());
  const isDarkMode = theme.dark;

  // Atualiza o tema quando o modo do sistema ou o tema selecionado mudar
  useEffect(() => {
    setThemeState(resolveTheme());
  }, [colorScheme, themeMode]);

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  };

  const setTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ theme, isDarkMode, toggleTheme, setTheme }), [theme, isDarkMode]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
