import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { 
  ThemeProvider, 
  useTheme, 
  Text, 
  Button, 
  Card, 
  Input, 
  Checkbox, 
  Select, 
  SelectOption,
  DatePicker,
  DateRangePicker
} from './src/design-system';

// Props para o componente ColorSwatch
interface ColorSwatchProps {
  color: string;
  name: string;
}

// Componente para exibir uma amostra de cor
const ColorSwatch = ({ color, name }: ColorSwatchProps) => {
  const { theme } = useTheme();
  return (
    <View style={styles.colorContainer}>
      <View style={[styles.colorSwatch, { backgroundColor: color }]} />
      <Text variant="caption" style={{ color: theme.colors.text }}>{name}</Text>
    </View>
  );
};

// Componente de separador
const Separator = () => {
  const { theme } = useTheme();
  return (
    <View 
      style={{
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 16
      }}
    />
  );
};

// Componente de demonstração para visualizar componentes do Design System
const DesignSystemDemo = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isChecked2, setIsChecked2] = useState(true);
  const [isCheckedDisabled, setIsCheckedDisabled] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string | number>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<{startDate?: string, endDate?: string}>({});

  // Opções para o Select
  const options: SelectOption[] = [
    { label: 'Opção 1', value: '1' },
    { label: 'Opção 2', value: '2' },
    { label: 'Opção 3', value: '3' },
    { label: 'Opção 4', value: '4' },
    { label: 'Opção 5', value: '5' },
  ];

  // Exemplo de validação do input
  const validateInput = (value: string) => {
    if (value.length < 3) {
      setInputError('O campo deve ter no mínimo 3 caracteres');
    } else {
      setInputError('');
    }
  };

  // Obter data atual e datas para exemplos
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Datas desabilitadas para exemplo
  const disabledDates = [
    formatDate(yesterday),
    formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)),
    formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text variant="h2" weight="bold">Design System</Text>
        <Text variant="subtitle1">Leasing Inventory App</Text>
        
        <View style={styles.themeToggle}>
          <Text variant="body2">Tema Escuro</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text variant="h4" weight="semibold">Paleta de Cores</Text>
        <View style={styles.colorRow}>
          <ColorSwatch color={theme.colors.primary} name="Primary" />
          <ColorSwatch color={theme.colors.secondary} name="Secondary" />
          <ColorSwatch color={theme.colors.background} name="Background" />
          <ColorSwatch color={theme.colors.surface} name="Surface" />
        </View>

        <Text variant="h6" weight="semibold" style={{ marginTop: 16 }}>Cores Acentuadas</Text>
        <View style={styles.colorRow}>
          <ColorSwatch color={theme.colors.accentPurple} name="Purple" />
          <ColorSwatch color={theme.colors.accentTeal} name="Teal" />
          <ColorSwatch color={theme.colors.accentOrange} name="Orange" />
          <ColorSwatch color={theme.colors.accentRed} name="Red" />
        </View>

        <Text variant="h6" weight="semibold" style={{ marginTop: 16 }}>Status</Text>
        <View style={styles.colorRow}>
          <ColorSwatch color={theme.colors.success} name="Success" />
          <ColorSwatch color={theme.colors.info} name="Info" />
          <ColorSwatch color={theme.colors.warning} name="Warning" />
          <ColorSwatch color={theme.colors.error} name="Error" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text variant="h4" weight="semibold">Componentes de Entrada</Text>
        
        <Text variant="h6" weight="semibold">Input</Text>
        <Input
          label="Input padrão"
          placeholder="Digite algo..."
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            validateInput(text);
          }}
          error={inputError}
        />
        
        <Input
          label="Input com senha"
          placeholder="Digite sua senha"
          secureTextEntry={!showPassword}
          value={passwordValue}
          onChangeText={setPasswordValue}
          endIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ color: theme.colors.primary }}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Text>
            </TouchableOpacity>
          }
          onEndIconPress={() => setShowPassword(!showPassword)}
        />
        
        <Input
          label="Input desabilitado"
          placeholder="Não é possível editar"
          value="Valor desabilitado"
          disabled
        />
        
        <Separator />
        
        <Text variant="h6" weight="semibold">Checkbox</Text>
        <View style={{ gap: 12 }}>
          <Checkbox
            label="Checkbox não marcado"
            checked={isChecked}
            onChange={setIsChecked}
          />
          
          <Checkbox
            label="Checkbox marcado"
            checked={isChecked2}
            onChange={setIsChecked2}
          />
          
          <Checkbox
            label="Checkbox desabilitado"
            checked={isCheckedDisabled}
            onChange={setIsCheckedDisabled}
            disabled
          />
        </View>
        
        <Separator />
        
        <Text variant="h6" weight="semibold">Select</Text>
        <Select
          label="Dropdown de opções"
          placeholder="Selecione uma opção..."
          options={options}
          value={selectedValue}
          onChange={setSelectedValue}
        />
        
        <Select
          label="Select com erro"
          options={options}
          value={''}
          onChange={setSelectedValue}
          error="É necessário selecionar uma opção"
        />
        
        <Select
          label="Select desabilitado"
          options={options}
          value={'1'}
          onChange={setSelectedValue}
          disabled
        />
        
        <Separator />
        
        <Text variant="h6" weight="semibold">DatePicker</Text>
        <DatePicker
          label="Seletor de data"
          placeholder="Selecione uma data..."
          value={selectedDate}
          onChange={setSelectedDate}
        />
        
        <DatePicker
          label="Com datas desabilitadas"
          value={selectedDate}
          onChange={setSelectedDate}
          disabledDates={disabledDates}
          minDate={formatDate(today)}
        />
        
        <Separator />
        
        <Text variant="h6" weight="semibold">DateRangePicker</Text>
        <DateRangePicker
          label="Seletor de período"
          placeholder="Selecione datas de início e fim..."
          value={dateRange}
          onChange={setDateRange}
        />
        
        <DateRangePicker
          label="Com data mínima e bloqueios"
          value={dateRange}
          onChange={setDateRange}
          disabledDates={disabledDates}
          minDate={formatDate(today)}
          error="Selecione um período válido"
        />
      </View>
      
      <View style={styles.section}>
        <Text variant="h4" weight="semibold">Tipografia</Text>
        <Text variant="h1">Título H1</Text>
        <Text variant="h2">Título H2</Text>
        <Text variant="h3">Título H3</Text>
        <Text variant="body1">Texto padrão body1</Text>
        <Text variant="body2">Texto secundário body2</Text>
        <Text variant="caption">Texto caption</Text>
      </View>
      
      <View style={styles.section}>
        <Text variant="h4" weight="semibold">Botões</Text>
        <View style={styles.buttonsRow}>
          <Button label="Primário" onPress={() => {}} variant="primary" />
          <Button label="Secundário" onPress={() => {}} variant="secondary" />
        </View>
        <View style={styles.buttonsRow}>
          <Button label="Outlined" onPress={() => {}} variant="outlined" />
          <Button label="Text" onPress={() => {}} variant="text" />
        </View>
        <View style={styles.buttonsRow}>
          <Button label="Pequeno" onPress={() => {}} size="small" />
          <Button label="Grande" onPress={() => {}} size="large" />
        </View>
        <View style={styles.buttonsRow}>
          <Button label="Desabilitado" onPress={() => {}} disabled />
          <Button label="Loading" onPress={() => {}} loading />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text variant="h4" weight="semibold">Cards</Text>
        <Card>
          <Text variant="h5">Card Básico</Text>
          <Text variant="body2">Este é um exemplo de card simples</Text>
        </Card>
        
        <Card style={{ marginTop: 16 }}>
          <Card.Title 
            title="Card com Título" 
            subtitle="Exemplo de subtítulo" 
          />
          <Card.Content>
            <Text variant="body1">Conteúdo do card com diferentes seções.</Text>
          </Card.Content>
          <Card.Actions>
            <Button label="Cancelar" variant="text" onPress={() => {}} />
            <Button label="OK" onPress={() => {}} />
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <DesignSystemDemo />
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    width: 150,
  },
  section: {
    marginBottom: 32,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorContainer: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
  },
  colorSwatch: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
});