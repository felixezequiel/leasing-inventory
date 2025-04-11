module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['react', '@typescript-eslint', 'import', 'react-hooks'],
  rules: {
    // Regras para garantir o uso do design system
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native',
            importNames: ['Text', 'Button'],
            message: 'Por favor, use os componentes do design system importando de "src/design-system" em vez dos componentes nativos.',
          },
          {
            name: 'react-native-paper',
            importNames: ['Button', 'Text', 'Card'],
            message: 'Por favor, use os componentes do design system importando de "src/design-system" em vez dos componentes do Paper diretamente.',
          },
        ],
      },
    ],
    // Impedir estilos inline
    'react/forbid-component-props': [
      'warn',
      {
        forbid: [
          {
            propName: 'style',
            message: 'Evite estilos inline. Prefira usar o StyleSheet para melhor consistência no design system.',
            allowedFor: ['View', 'ScrollView', 'SafeAreaView'],
          },
        ],
      },
    ],
    // Regras adicionais
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 