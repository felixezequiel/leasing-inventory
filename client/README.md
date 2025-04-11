# Leasing Inventory - Design System

## Visão Geral

Este design system foi criado para garantir consistência visual e de experiência do usuário em toda a aplicação Leasing Inventory. Ele fornece:

- Conjunto de componentes reutilizáveis
- Sistema de temas (claro/escuro)
- Tipografia consistente
- Paleta de cores padronizada
- Espaçamentos e bordas consistentes

## Componentes

### Estrutura de Diretórios

```
src/design-system/
  ├── components/       # Componentes reutilizáveis 
  ├── themes/           # Definições de temas
  ├── styles/           # Utilitários de estilo
  └── index.ts          # Exportação central do Design System
```

### Principais Componentes

- **Text**: Componente para exibição de texto com variantes para diferentes hierarquias (h1-h6, body, caption, etc)
- **Button**: Botões customizáveis com variantes (primary, secondary, outlined, text)
- **Card**: Componente de card para agrupamento de conteúdo

## Uso

Importe componentes do design system em vez de usar os componentes nativos do React Native ou React Native Paper:

```tsx
// ✅ Correto
import { Text, Button, Card } from 'src/design-system';

// ❌ Evitar
import { Text } from 'react-native';
import { Button } from 'react-native-paper';
```

### Temas

O Design System suporta temas claro e escuro, com configuração automática baseada nas preferências do sistema:

```tsx
// Envolver aplicação no ThemeProvider
import { ThemeProvider } from 'src/design-system';

function App() {
  return (
    <ThemeProvider>
      {/* Resto da aplicação */}
    </ThemeProvider>
  );
}
```

Acesse o tema atual em qualquer componente:

```tsx
import { useTheme } from 'src/design-system';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  // Use theme.colors, theme.spacing, etc.
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {/* Conteúdo do componente */}
    </View>
  );
}
```

## Boas Práticas

1. **Evite estilos inline**: Use StyleSheet para definir estilos
2. **Use cores do tema**: Acesse cores via `theme.colors.xxx` em vez de hardcoded
3. **Espaçamento consistente**: Use `theme.spacing.xx` em vez de valores fixos
4. **Reutilize componentes**: Prefira compor com componentes existentes

## Configuração ESLint

Para garantir o uso correto do design system, adicionamos regras ao ESLint que:

- Previnem a importação direta de componentes básicos (Text, Button, etc.)
- Avisam sobre uso excessivo de estilos inline
- Incentivam a consistência de código

Para executar a verificação de lint:

```
npm run lint
``` 