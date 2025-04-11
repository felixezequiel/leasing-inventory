import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/design-system';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import * as Localization from 'expo-localization';

export default function App() {
  useEffect(() => {
    // Detecta o idioma do dispositivo
    const deviceLanguage = Localization.locale.split('-')[0]; // Pega apenas o código do idioma (ex: 'pt' de 'pt-BR')
    
    // Verifica se o idioma está disponível nas traduções
    const availableLanguages = ['pt', 'en'];
    const languageToUse = availableLanguages.includes(deviceLanguage) ? deviceLanguage : 'pt';
    
    // Define o idioma
    i18n.changeLanguage(languageToUse);
  }, []);

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <PaperProvider>
            <AppNavigator />
          </PaperProvider>
        </ThemeProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}