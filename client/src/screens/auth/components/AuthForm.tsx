import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { AppTheme, Input } from '../../../design-system';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  return (
    <>
      {mode === 'register' && (
        <Input
          label={t('auth.name')}
          value={formData.name}
          onChangeText={(value) => onUpdateField('name', value)}
          placeholder={t('auth.enter_name')}
          autoCapitalize="words"
          containerStyle={styles.input}
        />
      )}

      <Input
        label={t('auth.email')}
        value={formData.email}
        onChangeText={(value) => onUpdateField('email', value)}
        placeholder={t('auth.enter_email')}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.input}
      />

      {mode !== 'recovery' && (
        <Input
          label={t('auth.password')}
          value={formData.password}
          onChangeText={(value) => onUpdateField('password', value)}
          placeholder={t('auth.enter_password')}
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
          label={t('auth.confirm_password')}
          value={formData.confirmPassword}
          onChangeText={(value) => onUpdateField('confirmPassword', value)}
          placeholder={t('auth.confirm_your_password')}
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