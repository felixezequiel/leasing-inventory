import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ViewStyle } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../themes/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';

// Formato padrão de data: YYYY-MM-DD
type DateString = string;

interface DateRange {
  startDate?: DateString;
  endDate?: DateString;
}

interface DateRangePickerProps {
  label?: string;
  value?: DateRange;
  onChange: (range: DateRange) => void;
  error?: string;
  placeholder?: string;
  disabledDates?: DateString[];
  minDate?: DateString;
  maxDate?: DateString;
  containerStyle?: ViewStyle;
}

export const DateRangePicker = ({
  label,
  value = {},
  onChange,
  error,
  placeholder = 'Selecione um período',
  disabledDates = [],
  minDate,
  maxDate,
  containerStyle,
}: DateRangePickerProps) => {
  const { theme } = useTheme();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');

  // Formata o intervalo de data para exibição
  const formatDisplayDateRange = (range?: DateRange) => {
    if (!range?.startDate && !range?.endDate) return placeholder;
    
    const formatDate = (date?: DateString) => {
      if (!date) return '';
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    };
    
    if (range.startDate && range.endDate) {
      return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
    }
    
    return formatDate(range.startDate || range.endDate);
  };

  // Cria um objeto com datas desabilitadas e datas selecionadas no formato esperado
  const getMarkedDates = () => {
    const markedDates: Record<string, any> = {};
    
    // Adiciona datas desabilitadas
    disabledDates.forEach(date => {
      markedDates[date] = { disabled: true };
    });
    
    // Adiciona data de início (se existir)
    if (tempRange.startDate) {
      markedDates[tempRange.startDate] = { 
        startingDay: true, 
        color: theme.colors.primary,
        textColor: '#fff'
      };
    }
    
    // Adiciona data de fim (se existir)
    if (tempRange.endDate) {
      markedDates[tempRange.endDate] = {
        endingDay: true,
        color: theme.colors.primary,
        textColor: '#fff'
      };
    }
    
    // Adiciona datas entre início e fim (se ambos existirem)
    if (tempRange.startDate && tempRange.endDate) {
      const start = new Date(tempRange.startDate);
      const end = new Date(tempRange.endDate);
      
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + 1);
      
      while (currentDate < end) {
        const dateString = currentDate.toISOString().split('T')[0];
        markedDates[dateString] = {
          color: theme.colors.primary + '50', // 50% opacity
          textColor: theme.colors.text
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return markedDates;
  };

  const handleDayPress = (day: DateData) => {
    if (selectionStep === 'start') {
      // Iniciando um novo intervalo
      setTempRange({ startDate: day.dateString });
      setSelectionStep('end');
    } else {
      // Selecionando data final
      const startDate = new Date(tempRange.startDate!);
      const endDate = new Date(day.dateString);
      
      // Se a data final for antes da data inicial, trocamos
      if (endDate < startDate) {
        setTempRange({
          startDate: day.dateString,
          endDate: tempRange.startDate
        });
      } else {
        setTempRange({
          ...tempRange,
          endDate: day.dateString
        });
      }
      
      // Resetamos para selecionar a data inicial no próximo ciclo
      setSelectionStep('start');
    }
  };

  const handleConfirm = () => {
    onChange(tempRange);
    setCalendarVisible(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    setSelectionStep('start');
    setCalendarVisible(false);
  };

  const handleClearDates = () => {
    setTempRange({});
    setSelectionStep('start');
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
            color: (value?.startDate || value?.endDate) ? theme.colors.text : theme.colors.textSecondary,
          }}
        >
          {formatDisplayDateRange(value)}
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
              {label || 'Selecione um período'}
            </Text>
            
            <Text variant="body2" style={styles.selectionInfo}>
              {selectionStep === 'start' 
                ? 'Selecione a data inicial' 
                : 'Selecione a data final'}
            </Text>

            <Calendar
              current={tempRange.startDate || new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markingType="period"
              markedDates={getMarkedDates()}
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
                'stylesheet.day.period': {
                  base: {
                    overflow: 'hidden',
                    height: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                },
              }}
            />

            <View style={styles.buttonContainer}>
              <Button 
                label="Limpar" 
                onPress={handleClearDates} 
                variant="text"
              />
              <View style={styles.rightButtons}>
                <Button 
                  label="Cancelar" 
                  onPress={handleCancel} 
                  variant="outlined"
                  style={{ marginRight: 8 }}
                />
                <Button 
                  label="Confirmar" 
                  onPress={handleConfirm} 
                  disabled={!tempRange.startDate}
                />
              </View>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  selectionInfo: {
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  rightButtons: {
    flexDirection: 'row',
  },
}); 