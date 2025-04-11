import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import { Text } from './Text';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  containerStyle,
}: CheckboxProps) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: disabled
              ? theme.colors.border
              : checked
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: checked
              ? disabled
                ? theme.colors.border
                : theme.colors.primary
              : 'transparent',
          },
        ]}
      >
        {checked && (
          <View
            style={[
              styles.checkmark,
              {
                borderColor: theme.colors.surface,
              },
            ]}
          />
        )}
      </View>

      {label && (
        <Text
          variant="body2"
          style={{
            marginLeft: 10,
            color: disabled ? theme.colors.textSecondary : theme.colors.text
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  label: {
    marginLeft: 10,
  },
}); 