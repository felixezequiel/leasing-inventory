export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  isProduction: process.env.NODE_ENV === 'production',
  
  // Different IDs based on platform
  googleAuth: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  },
  
  // Deep linking scheme
  appScheme: 'leasing-inventory',
}; 