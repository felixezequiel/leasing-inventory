import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, FlatList, ViewStyle } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import { Text } from './Text';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const Select = ({
  label,
  placeholder = 'Selecione uma opção',
  options,
  value,
  onChange,
  error,
  disabled = false,
  containerStyle,
}: SelectProps) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setModalVisible(false);
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (disabled) return theme.colors.border;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text 
          variant="body2" 
          style={{ 
            marginBottom: 8,
            color: error 
              ? theme.colors.error 
              : disabled
                ? theme.colors.textSecondary
                : theme.colors.textSecondary
          }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: disabled ? theme.colors.background : theme.colors.surface,
          },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text
          variant="body1"
          style={{
            color: selectedOption
              ? disabled 
                ? theme.colors.textSecondary 
                : theme.colors.text
              : theme.colors.textSecondary,
            flex: 1,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <View
          style={[
            styles.arrow,
            {
              borderTopColor: disabled
                ? theme.colors.textSecondary
                : theme.colors.text,
            },
          ]}
        />
      </TouchableOpacity>

      {error && (
        <Text variant="caption" style={{ marginTop: 8, color: theme.colors.error }}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text variant="h6" style={styles.modalTitle}>
              {label || 'Selecione uma opção'}
            </Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor:
                        item.value === value
                          ? theme.colors.primary + '20' // 20% opacity
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    variant="body1"
                    style={{
                      color:
                        item.value === value
                          ? theme.colors.primary
                          : theme.colors.text,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalTitle: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
}); 