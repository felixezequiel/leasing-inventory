# MeuMonoRepo

Este é um monorepo TypeScript contendo projetos de cliente (React Native com Expo) e servidor (Express com decorators), além de uma pasta compartilhada.

## Estrutura do Projeto

```
MeuMonoRepo/
├── client/       # React Native com Expo (Clean Architecture)
├── server/       # Express com Decorators (Clean Architecture)
└── shared/       # Código compartilhado entre client e server
    ├── dtos/     # Data Transfer Objects
    └── helpers/  # Funções utilitárias
```

## Instruções para Execução

### Cliente (React Native com Expo)

```bash
cd client
npm install
npm start
```

### Servidor (Express)

```bash
cd server
npm install
npm run dev
```

## Configuração de Desenvolvimento

Cada projeto pode ser desenvolvido independentemente, mas compartilham código através da pasta `shared`. 