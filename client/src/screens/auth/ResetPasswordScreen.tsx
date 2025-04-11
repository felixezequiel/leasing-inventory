import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Input, Button } from '../../design-system';
import { MaterialIcons } from '@expo/vector-icons';

export const ResetPasswordScreen = () => {
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Obter o token da URL
  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async () => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.formContainer}>
          <Text variant="h4" weight="bold" style={styles.title}>
            Password Reset Successful
          </Text>
          <Text variant="body1" style={styles.message}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>
          <Button
            onPress={() => window.location.href = '/auth'}
            style={styles.button}
            label="Go to Login"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.formContainer}>
        <Text variant="h4" weight="bold" style={styles.title}>
          Reset Password
        </Text>

        {error && (
          <Text
            variant="body2"
            style={{ ...styles.errorText, color: theme.colors.error }}
          >
            {error}
          </Text>
        )}

        <Input
          label="New Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your new password"
          secureTextEntry={!showPassword}
          containerStyle={styles.input}
          endIcon={
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={theme.colors.textSecondary}
            />
          }
          onEndIconPress={() => setShowPassword(!showPassword)}
        />

        <Input
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your new password"
          secureTextEntry={!showPassword}
          containerStyle={styles.input}
        />

        <Button
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
          label="Reset Password"
        />
      </View>
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
    borderRadius: 12,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
}); 