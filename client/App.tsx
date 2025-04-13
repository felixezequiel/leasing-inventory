import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/design-system';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import * as Localization from 'expo-localization';
import { LogBox } from 'react-native';
import { registerRootComponent } from 'expo';
import * as WebBrowser from 'expo-web-browser';
import { EnvironmentControl } from '@/utils/environmentControl';

// Suppress warnings about deep linking
LogBox.ignoreLogs(['Linking requires a build-time setting']);

export default function App() {
  useEffect(() => {
    // Inicializa o WebBrowser (necessário para autenticação OAuth)
    if (EnvironmentControl.isMobile()) WebBrowser.warmUpAsync();

    // Detecta o idioma do dispositivo
    const deviceLanguage = Localization.locale.split('-')[0]; // Pega apenas o código do idioma (ex: 'pt' de 'pt-BR')
    
    // Verifica se o idioma está disponível nas traduções
    const availableLanguages = ['pt', 'en'];
    const languageToUse = availableLanguages.includes(deviceLanguage) ? deviceLanguage : 'pt';
    
    // Define o idioma
    i18n.changeLanguage(languageToUse);

    // Limpeza ao desmontar o componente
    return () => {
      WebBrowser.coolDownAsync();
    };
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

// Register the app with deep linking configuration
registerRootComponent(App);