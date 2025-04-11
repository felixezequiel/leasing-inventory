import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Definição das cores base do design system
// Inspirado nas paletas da Atlassian Design System e outras referências modernas
const colors = {
  // Cores primárias - tons de azul inspirados no Atlassian Design
  primary: {
    light: '#0052CC', // Azul mais vibrante para o tema claro
    dark: '#4C9AFF', // Azul mais claro e brilhante para destaque no tema escuro
  },
  // Cores secundárias - tons verdes modernos
  secondary: {
    light: '#36B37E', // Verde mais suave e moderno
    dark: '#57D9A3', // Verde mais claro para o tema escuro
  },
  // Cores neutras para fundos
  background: {
    light: '#F4F5F7', // Cinza muito claro com leve tom azulado
    dark: '#0E1624', // Azul escuro quase preto (mais confortável que preto puro)
  },
  // Cores de superfície (cards, botões, etc)
  surface: {
    light: '#FFFFFF',
    dark: '#1C2B41', // Azul escuro mais suave que o fundo
  },
  // Cores de texto
  text: {
    light: {
      primary: '#172B4D', // Azul escuro em vez de preto puro
      secondary: '#5E6C84', // Cinza azulado médio
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#B8C7E0', // Azul claro acinzentado
    },
  },
  // Cores de status - tons mais modernos e menos saturados
  status: {
    error: '#DE350B', // Vermelho menos saturado
    warning: '#FFAB00', // Amarelo âmbar
    success: '#00875A', // Verde mais escuro e menos saturado
    info: '#0065FF', // Azul informativo
  },
  // Cores de borda
  border: {
    light: '#DFE1E6', // Cinza azulado muito claro
    dark: '#2C3E5D', // Azul escuro para bordas no tema escuro
  },
  // Cores acentuadas para destaques e variações
  accent: {
    purple: {
      light: '#6554C0', // Roxo
      dark: '#8777D9',
    },
    teal: {
      light: '#00B8D9', // Azul esverdeado
      dark: '#79E2F2',
    },
    orange: {
      light: '#FF8B00', // Laranja
      dark: '#FFB400',
    },
    red: {
      light: '#DE350B', // Vermelho
      dark: '#FF5630',
    }
  }
};

// Espaçamentos consistentes
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Radianos para bordas
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 9999,
};

// Tamanhos de fonte
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Pesos de fonte
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Tema claro
export const LightTheme = {
  ...MD3LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: colors.primary.light,
    secondary: colors.secondary.light,
    background: colors.background.light,
    surface: colors.surface.light,
    text: colors.text.light.primary,
    textSecondary: colors.text.light.secondary,
    border: colors.border.light,
    error: colors.status.error,
    warning: colors.status.warning,
    success: colors.status.success,
    info: colors.status.info,
    // Cores acentuadas adicionais
    accentPurple: colors.accent.purple.light,
    accentTeal: colors.accent.teal.light,
    accentOrange: colors.accent.orange.light,
    accentRed: colors.accent.red.light,
  },
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  dark: false,
};

// Tema escuro
export const DarkTheme = {
  ...MD3DarkTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: colors.primary.dark,
    secondary: colors.secondary.dark,
    background: colors.background.dark,
    surface: colors.surface.dark,
    text: colors.text.dark.primary,
    textSecondary: colors.text.dark.secondary,
    border: colors.border.dark,
    error: colors.status.error,
    warning: colors.status.warning,
    success: colors.status.success,
    info: colors.status.info,
    // Cores acentuadas adicionais
    accentPurple: colors.accent.purple.dark,
    accentTeal: colors.accent.teal.dark,
    accentOrange: colors.accent.orange.dark,
    accentRed: colors.accent.red.dark,
  },
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  dark: true,
};

export type AppTheme = typeof LightTheme; 