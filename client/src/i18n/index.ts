import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en';
import ptTranslations from './locales/pt';

// Configuração básica para o i18next
i18next
  // passa o módulo i18next para react-i18next
  .use(initReactI18next)
  // Inicializa o i18next
  .init({
    // Recursos com as traduções
    resources: {
      en: {
        translation: enTranslations
      },
      pt: {
        translation: ptTranslations
      }
    },
    // Idioma padrão
    lng: 'pt',
    fallbackLng: 'pt',
    
    // Habilita o modo de depuração em desenvolvimento
    debug: __DEV__,
    
    // Configurações específicas para React Native
    react: {
      useSuspense: false,
    },
    
    // Não atrasa a inicialização
    initImmediate: false,
    
    // Compatibilidade com React Native
    compatibilityJSON: 'v3',
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18next; 