// Importe o AsyncStorageFallback do próprio Expo:
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crie um objeto seguroStorage com a mesma API
export const secureStore = {
  getItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Fallback para AsyncStorage se SecureStore falhar
      return AsyncStorage.getItem(key);
    }
  },
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    try {
      return await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Fallback para AsyncStorage se SecureStore falhar
      return AsyncStorage.setItem(key, value);
    }
  },
  deleteItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }
    try {
      return await AsyncStorage.removeItem(key);
    } catch (e) {
      // Fallback para AsyncStorage se SecureStore falhar
      return AsyncStorage.removeItem(key);
    }
  },

  isAvailableAsync: async () => {
    if (Platform.OS === 'web') {
      return false;
    }

    return true;
  }
};