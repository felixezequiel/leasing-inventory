import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Configuration for URL schemes used in deep linking
 * based on the environment
 */
const urlSchemes = {
  // The scheme defined in app.json
  scheme: Constants.manifest?.scheme || 'leasing-inventory',
  
  // For Google auth deep linking
  getAuthRedirectUrl: () => {
    const scheme = Constants.manifest?.scheme || 'leasing-inventory';
    
    // Development configuration
    if (__DEV__) {
      if (Platform.OS === 'android') {
        return `${scheme}://auth`;
      } else if (Platform.OS === 'ios') {
        return `${scheme}://auth`;
      } else {
        // Web in development
        return 'http://localhost:8081/auth';
      }
    } 
    
    // Production configuration
    else {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        return `${scheme}://auth`;
      } else {
        // Web in production - use actual domain
        return 'https://your-production-domain.com/auth';
      }
    }
  }
};

export default urlSchemes; 