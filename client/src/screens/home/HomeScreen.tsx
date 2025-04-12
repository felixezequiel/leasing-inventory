import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text } from '../../design-system';

export const HomeScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="h2" weight="bold" align="center">
        Home
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
}); 