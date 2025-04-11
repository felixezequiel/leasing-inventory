import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button = ({
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  labelStyle,
  ...props
}: ButtonProps) => {
  const { theme } = useTheme();
  
  // Mapeia as variantes para props do Button do Paper
  const getMode = (): 'contained' | 'outlined' | 'text' | 'contained-tonal' | 'elevated' => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained-tonal';
      case 'outlined':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  // Mapeia tamanhos para estilos
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
        };
      case 'medium':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
        };
      default:
        return {};
    }
  };

  const getTextStyles = (): TextStyle => {
    switch (size) {
      case 'small':
        return {
          fontSize: theme.fontSize.sm,
        };
      case 'medium':
        return {
          fontSize: theme.fontSize.md,
        };
      case 'large':
        return {
          fontSize: theme.fontSize.lg,
        };
      default:
        return {};
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      contentStyle={[
        styles.button,
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      labelStyle={[
        styles.label,
        getTextStyles(),
        labelStyle,
      ]}
      {...props}
    >
      {label}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
  },
}); 