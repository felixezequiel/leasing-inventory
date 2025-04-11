import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppTheme, Text } from '../../../design-system';

type AuthMode = 'login' | 'register' | 'recovery';

interface AuthFooterProps {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
  theme: AppTheme;
}

interface FooterLinkProps {
  onPress: () => void;
  text: string;
  color: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ onPress, text, color }) => (
  <TouchableOpacity onPress={onPress} style={styles.linkContainer}>
    <Text 
      variant="body2" 
      align="center"
      style={{ color }}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

export const AuthFooter: React.FC<AuthFooterProps> = ({ mode, onSwitchMode, theme }) => {
  const isLoginMode = mode === 'login';
  
  const renderLoginFooter = () => (
    <View style={styles.loginFooter}>
      <FooterLink
        onPress={() => onSwitchMode('recovery')}
        text="Forgot Password?"
        color={theme.colors.primary}
      />
      <FooterLink
        onPress={() => onSwitchMode('register')}
        text="Don't have an account? Sign Up"
        color={theme.colors.primary}
      />
    </View>
  );

  const getAlternateActionText = () => {
    const actionTextMap = {
      register: 'Already have an account? Sign In',
      recovery: 'Back to Sign In'
    };
    
    const text = actionTextMap[mode as 'register' | 'recovery'];
    
    return (
      <FooterLink
        onPress={() => onSwitchMode('login')}
        text={text}
        color={theme.colors.primary}
      />
    );
  };

  const footerContent = isLoginMode ? renderLoginFooter() : getAlternateActionText();

  return (
    <View style={styles.footer}>
      {footerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 32,
  },
  loginFooter: {
    alignItems: 'center',
  },
  linkContainer: {
    paddingVertical: 8,
  },
});
