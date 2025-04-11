import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  onEndIconPress?: () => void;
  disabled?: boolean;
}

export const Input = ({
  label,
  error,
  startIcon,
  endIcon,
  containerStyle,
  onEndIconPress,
  style,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  disabled = false,
  ...rest
}: InputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    rest.onFocus && rest.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    rest.onBlur && rest.onBlur(e);
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (disabled) return theme.colors.border;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text 
          variant="body2" 
          style={{
            marginBottom: 8,
            color: error 
              ? theme.colors.error 
              : disabled 
                ? theme.colors.textSecondary 
                : theme.colors.textSecondary
          }}
        >
          {label}
        </Text>
      )}
      
      <View 
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: disabled ? theme.colors.background : theme.colors.surface,
          },
          isFocused && styles.focusedInput,
        ]}
      >
        {startIcon && <View style={styles.iconContainer}>{startIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            { 
              color: disabled ? theme.colors.textSecondary : theme.colors.text,
              paddingLeft: startIcon ? 0 : theme.spacing.md,
              paddingRight: endIcon ? 0 : theme.spacing.md,
            },
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          {...rest}
        />
        
        {endIcon && (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={onEndIconPress}
            disabled={disabled || !onEndIconPress}
          >
            {endIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text 
          variant="caption" 
          style={{
            marginTop: 8,
            color: theme.colors.error
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  focusedInput: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  iconContainer: {
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: 8,
  },
}); 