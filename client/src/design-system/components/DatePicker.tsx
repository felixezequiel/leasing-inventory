import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ViewStyle } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../themes/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';

// Formato padrão de data: YYYY-MM-DD
type DateString = string;

interface DatePickerProps {
  label?: string;
  value?: DateString;
  onChange: (date: DateString) => void;
  error?: string;
  placeholder?: string;
  disabledDates?: DateString[];
  minDate?: DateString;
  maxDate?: DateString;
  containerStyle?: ViewStyle;
}

export const DatePicker = ({
  label,
  value,
  onChange,
  error,
  placeholder = 'Selecione uma data',
  disabledDates = [],
  minDate,
  maxDate,
  containerStyle,
}: DatePickerProps) => {
  const { theme } = useTheme();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateString | undefined>(value);

  // Formata a data para exibição no formato DD/MM/YYYY
  const formatDisplayDate = (date?: DateString) => {
    if (!date) return placeholder;
    
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  // Cria um objeto com datas desabilitadas no formato esperado pela biblioteca
  const getDisabledDates = () => {
    const disabledDatesObj: Record<string, { disabled: boolean }> = {};
    
    disabledDates.forEach(date => {
      disabledDatesObj[date] = { disabled: true };
    });
    
    return disabledDatesObj;
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    setCalendarVisible(false);
  };

  const handleCancel = () => {
    setSelectedDate(value);
    setCalendarVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text 
          variant="body2" 
          style={{ 
            marginBottom: 8,
            color: error ? theme.colors.error : theme.colors.textSecondary
          }}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.datePickerButton,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
        onPress={() => setCalendarVisible(true)}
      >
        <Text
          variant="body1"
          style={{
            color: value ? theme.colors.text : theme.colors.textSecondary,
          }}
        >
          {formatDisplayDate(value)}
        </Text>

        <View style={styles.calendarIcon}>
          {/* Ícone simples de calendário */}
          <View 
            style={[
              styles.calendarIconTop, 
              { backgroundColor: theme.colors.primary }
            ]} 
          />
          <View 
            style={[
              styles.calendarIconBody, 
              { borderColor: theme.colors.primary }
            ]}
          />
        </View>
      </TouchableOpacity>

      {error && (
        <Text 
          variant="caption" 
          style={{ 
            marginTop: 8,
            color: theme.colors.error 
          }}
        >
          {error}
        </Text>
      )}

      <Modal
        visible={isCalendarVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View 
            style={[
              styles.calendarContainer,
              { backgroundColor: theme.colors.surface }
            ]}
          >
            <Text variant="h6" style={styles.modalTitle}>
              {label || 'Selecione uma data'}
            </Text>

            <Calendar
              current={selectedDate || new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{
                ...(selectedDate && {
                  [selectedDate]: { selected: true, selectedColor: theme.colors.primary },
                }),
                ...getDisabledDates(),
              }}
              minDate={minDate}
              maxDate={maxDate}
              disableAllTouchEventsForDisabledDays
              theme={{
                calendarBackground: theme.colors.surface,
                textSectionTitleColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.textSecondary,
                dotColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14,
              }}
            />

            <View style={styles.buttonContainer}>
              <Button 
                label="Cancelar" 
                onPress={handleCancel} 
                variant="text"
              />
              <Button 
                label="Confirmar" 
                onPress={handleConfirm} 
                disabled={!selectedDate}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
  },
  calendarIconTop: {
    width: 14,
    height: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarIconBody: {
    width: 18,
    height: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
}); 