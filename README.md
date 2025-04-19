# Leasing Inventory

Este é um monorepo que contém três projetos principais:

## Estrutura do Projeto

```
.
├── client/           # Frontend da aplicação
├── server/           # Backend da aplicação
└── shared/           # Código compartilhado entre client e server
```

## Projetos

### Client (Frontend)
- Localizado em `/client`
- Pipeline independente no GitHub Actions
- Para desenvolvimento:
  ```bash
  cd client
  npm install
  npm run dev
  ```

### Server (Backend)
- Localizado em `/server`
- Pipeline independente no GitHub Actions
- Para desenvolvimento:
  ```bash
  cd server
  npm install
  npm run dev
  ```

### Shared (Código Compartilhado)
- Localizado em `/shared`
- Contém tipos, interfaces e utilitários compartilhados
- É referenciado como dependência local nos projetos client e server

## Desenvolvimento

Cada projeto (client e server) é independente e possui seu próprio:
- `package.json`
- Scripts de build
- Pipeline de CI/CD
- Configurações de desenvolvimento

### Como trabalhar com o código compartilhado

O código compartilhado em `/shared` é referenciado nos `package.json` do client e server como uma dependência local:

```json
{
  "dependencies": {
    "shared": "file:../shared"
  }
}
```

## Pipelines

- **Client**: `.github/workflows/client.yml`
  - Triggered por mudanças em `client/**` ou `shared/**`
  - Roda build, testes e lint no código do frontend

- **Server**: `.github/workflows/server.yml`
  - Triggered por mudanças em `server/**` ou `shared/**`
  - Roda build, testes e lint no código do backend

## Instalação

1. Clone o repositório
2. Instale as dependências de cada projeto:
   ```bash
   # Shared
   cd shared
   npm install

   # Client
   cd ../client
   npm install

   # Server
   cd ../server
   npm install
   ```

## Scripts Disponíveis

Cada projeto tem seus próprios scripts no `package.json`. Execute-os no diretório correspondente:

- `npm run dev` - Inicia o ambiente de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run test` - Executa os testes
- `npm run lint` - Executa o linter 