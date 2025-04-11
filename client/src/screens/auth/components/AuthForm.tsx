import React from 'react';
import { StyleSheet } from 'react-native';
import { AppTheme, Input } from '../../../design-system';
import { MaterialIcons } from '@expo/vector-icons';

type AuthMode = 'login' | 'register' | 'recovery';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface AuthFormProps {
  mode: AuthMode;
  formData: FormData;
  showPassword: boolean;
  onUpdateField: (field: keyof FormData, value: string) => void;
  onTogglePassword: () => void;
  theme: AppTheme;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  formData,
  showPassword,
  onUpdateField,
  onTogglePassword,
  theme,
}) => {
  return (
    <>
      {mode === 'register' && (
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(value) => onUpdateField('name', value)}
          placeholder="Enter your name"
          autoCapitalize="words"
          containerStyle={styles.input}
        />
      )}

      <Input
        label="Email"
        value={formData.email}
        onChangeText={(value) => onUpdateField('email', value)}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.input}
      />

      {mode !== 'recovery' && (
        <Input
          label="Password"
          value={formData.password}
          onChangeText={(value) => onUpdateField('password', value)}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          containerStyle={styles.input}
          endIcon={
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={theme.colors.textSecondary}
            />
          }
          onEndIconPress={onTogglePassword}
        />
      )}

      {mode === 'register' && (
        <Input
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => onUpdateField('confirmPassword', value)}
          placeholder="Confirm your password"
          secureTextEntry={!showPassword}
          containerStyle={styles.input}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
}); 