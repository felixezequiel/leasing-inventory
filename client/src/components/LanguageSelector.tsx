import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { Text } from '../design-system';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'pt';

  const handleLanguageChange = (languageCode: string) => {
    console.log(`Alterando idioma para: ${languageCode}`);
    i18n.changeLanguage(languageCode);
    console.log(`Idioma após mudança: ${i18n.language}`);
  };

  const getTextStyle = (isActive: boolean): TextStyle => ({
    color: isActive ? '#000000' : '#666666',
  });

  return (
    <View style={styles.container}>
      {languages.map((language) => {
        const isActive = currentLanguage.startsWith(language.code);
        return (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleLanguageChange(language.code)}
            style={[
              styles.languageButton,
              isActive && styles.activeLanguage,
            ]}
          >
            <Text
              variant="body2"
              style={getTextStyle(isActive)}
            >
              {language.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  activeLanguage: {
    backgroundColor: '#E8E8E8',
  },
}); 