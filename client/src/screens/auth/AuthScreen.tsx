import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme, Text, Button, Card } from '../../design-system';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import { AuthFooter } from './components/AuthFooter';

type AuthMode = 'login' | 'register' | 'recovery';

export const AuthScreen = () => {
  const { theme } = useTheme();
  const { handleSubmit, handleGoogleLogin, isLoading, error } = useAuth();
  const [authState, setAuthState] = useState({
    mode: 'login' as AuthMode,
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
    ui: {
      showPassword: false,
    },
  });

  const updateFormData = (field: keyof typeof authState.formData, value: string) => {
    setAuthState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  const togglePasswordVisibility = () => {
    setAuthState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        showPassword: !prev.ui.showPassword,
      },
    }));
  };

  const switchMode = (newMode: AuthMode) => {
    setAuthState(prev => ({
      ...prev,
      mode: newMode,
      formData: {
        ...prev.formData,
        password: '',
        confirmPassword: '',
      },
    }));
  };

  const getTitleText = () => {
    const titleMap = {
      login: 'Welcome Back',
      register: 'Create Account',
      recovery: 'Reset Password'
    };
    return titleMap[authState.mode];
  };

  const getSubmitButtonText = () => {
    const buttonTextMap = {
      login: 'Sign In',
      register: 'Create Account',
      recovery: 'Send Recovery Email'
    };
    return buttonTextMap[authState.mode];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.formContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="h4" weight="bold" align="center">
            {getTitleText()}
          </Text>
        </View>

        {error && (
          <Text
            variant="body2"
            align="center"
            style={{ color: theme.colors.error, marginBottom: theme.spacing.md }}
          >
            {error}
          </Text>
        )}

        <AuthForm
          mode={authState.mode}
          formData={authState.formData}
          showPassword={authState.ui.showPassword}
          onUpdateField={updateFormData}
          onTogglePassword={togglePasswordVisibility}
          theme={theme}
        />

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => handleSubmit(authState.mode, authState.formData)}
            loading={isLoading}
            label={getSubmitButtonText()}
            size="large"
            fullWidth
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Text variant="body2" style={{ color: theme.colors.textSecondary, marginHorizontal: theme.spacing.sm }}>
              or
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>

          <Button
            variant="outlined"
            onPress={handleGoogleLogin}
            icon="google"
            label="Continue with Google"
            size="large"
            fullWidth
          />
        </View>

        <AuthFooter
          mode={authState.mode}
          onSwitchMode={switchMode}
          theme={theme}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 32,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
}); 