import { Platform } from 'react-native';

export class EnvironmentControl {
  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  static isBrowser() {
    return typeof window !== 'undefined' && Platform.OS === 'web';
  }

  static isMobile() {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  static isAndroid() {
    return Platform.OS === 'android';
  }

  static isIOS() {
    return Platform.OS === 'ios';
  }

  static isWeb() {
    return Platform.OS === 'web';
  }

  static getPlatform() {
    return Platform.OS;
  }

  static clientId() {
    if (this.isWeb()) {
      return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    }
    
    if (this.isIOS()) {
      return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    }
    
    // Android ou fallback para outros
    return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  }

  static getRedirectUri() {
    if (this.isWeb()) {
      // Para web, usar localhost ou domínio de produção
      return this.isProduction() 
        ? 'https://seu-dominio-de-producao.com/auth' 
        : 'http://localhost:8081';
    }
    
    // Para mobile (Android/iOS), usar o esquema do app
    return 'leasing-inventory://auth';
  }

  static shouldUseAuthProxy() {
    // Útil para desenvolvimento em dispositivos iOS/Android
    return this.isDevelopment() && this.isMobile();
  }
}
