import { config } from '@/config/env';

// Deep linking configuration for the app
export const linking = {
  prefixes: [`${config.appScheme}://`, 'https://yourdomain.com'],
  config: {
    screens: {
      Auth: 'auth',
      ResetPassword: 'reset-password',
      Home: 'home',
    },
  },
}; 