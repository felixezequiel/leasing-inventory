import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { useTheme, Text, Button } from '@/design-system';
import authService from '@/services/AuthService';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const user = authService.getUser();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = async () => {
    await authService.logout();
    setMenuVisible(false);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setMenuVisible(false);
  };

  // URL da imagem padrão se o usuário não tiver uma foto de perfil
  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User');
  
  // Aqui você pode obter a foto do perfil do Google, se disponível
  // Como o UserDTO não inclui photoURL, usamos o avatar padrão
  const userAvatar = defaultAvatar;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com o menu do usuário */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="h2" weight="bold" color="white" style={styles.headerTitle}>
          Home
        </Text>
        <TouchableOpacity onPress={toggleMenu} style={styles.avatarContainer}>
          <Image 
            source={{ uri: userAvatar }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Text variant="body1" align="center">
          {user?.name ? `${t('auth.welcome_back')}, ${user.name}!` : ''}
        </Text>
      </View>

      {/* Modal para o menu do usuário */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={toggleMenu}
        >
          <View 
            style={[
              styles.menuContainer, 
              { backgroundColor: theme.colors.background }
            ]}
          >
            <View style={styles.menuHeader}>
              <Text variant="h3" weight="bold">
                {t('home.user_menu')}
              </Text>
              <TouchableOpacity onPress={toggleMenu}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Image 
                source={{ uri: userAvatar }} 
                style={styles.menuAvatar} 
              />
              <Text variant="h4" weight="bold" style={styles.userName}>
                {user?.name || 'User'}
              </Text>
              <Text variant="body1">
                {user?.email || ''}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.menuOptions}>
              <Text variant="h4" weight="bold" style={styles.menuSectionTitle}>
                {t('home.languages')}
              </Text>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => changeLanguage('pt')}
              >
                <Text variant="body1">
                  {t('home.portuguese')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => changeLanguage('en')}
              >
                <Text variant="body1">
                  {t('home.english')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Button
              onPress={handleLogout}
              variant="secondary"
              label={t('home.logout')}
              style={styles.logoutButton}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    marginLeft: 8,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    width: '100%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 16,
  },
  menuAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  menuOptions: {
    marginBottom: 16,
  },
  menuSectionTitle: {
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  logoutButton: {
    marginVertical: 8,
  },
}); 