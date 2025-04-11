import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  color?: string;
  style?: TextStyle;
}

export const Text = ({
  children,
  variant = 'body1',
  weight = 'regular',
  align = 'auto',
  color,
  style,
  ...props
}: TextProps) => {
  const { theme } = useTheme();

  // Mapeia variantes para estilos
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return { fontSize: theme.fontSize.xxxl, lineHeight: theme.fontSize.xxxl * 1.2 };
      case 'h2':
        return { fontSize: theme.fontSize.xxl, lineHeight: theme.fontSize.xxl * 1.2 };
      case 'h3':
        return { fontSize: theme.fontSize.xl, lineHeight: theme.fontSize.xl * 1.2 };
      case 'h4':
        return { fontSize: theme.fontSize.lg, lineHeight: theme.fontSize.lg * 1.2 };
      case 'h5':
        return { fontSize: theme.fontSize.md, lineHeight: theme.fontSize.md * 1.2 };
      case 'h6':
        return { fontSize: theme.fontSize.sm, lineHeight: theme.fontSize.sm * 1.2 };
      case 'subtitle1':
        return { fontSize: theme.fontSize.lg, lineHeight: theme.fontSize.lg * 1.5 };
      case 'subtitle2':
        return { fontSize: theme.fontSize.md, lineHeight: theme.fontSize.md * 1.5 };
      case 'body1':
        return { fontSize: theme.fontSize.md, lineHeight: theme.fontSize.md * 1.5 };
      case 'body2':
        return { fontSize: theme.fontSize.sm, lineHeight: theme.fontSize.sm * 1.5 };
      case 'caption':
        return { fontSize: theme.fontSize.xs, lineHeight: theme.fontSize.xs * 1.5 };
      case 'button':
        return { fontSize: theme.fontSize.md, lineHeight: theme.fontSize.md * 1.5 };
      case 'overline':
        return { fontSize: theme.fontSize.xs, lineHeight: theme.fontSize.xs * 1.5, textTransform: 'uppercase' };
      default:
        return { fontSize: theme.fontSize.md, lineHeight: theme.fontSize.md * 1.5 };
    }
  };

  // Mapeia pesos para valores de fontWeight
  const getWeightStyle = (): TextStyle => {
    switch (weight) {
      case 'regular':
        return { fontWeight: '400' };
      case 'medium':
        return { fontWeight: '500' };
      case 'semibold':
        return { fontWeight: '600' };
      case 'bold':
        return { fontWeight: '700' };
      default:
        return { fontWeight: '400' };
    }
  };

  return (
    <RNText
      style={[
        styles.text,
        getVariantStyle(),
        getWeightStyle(),
        { 
          textAlign: align,
          color: color || theme.colors.text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    // Estilos base para todo texto
  },
}); 