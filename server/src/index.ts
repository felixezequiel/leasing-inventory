import 'reflect-metadata';
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

// Importa a configuração do servidor
import { serverConfig } from '@infra/config/server.config';

async function bootstrap() {
  // Cria a instância do Express
  const app = express();

  // Middlewares globais
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Configura o routing-controllers
  useExpressServer(app, {
    controllers: [path.join(__dirname, 'presentation/controllers/**/*.controller.{ts,js}')],
    middlewares: [path.join(__dirname, 'presentation/middlewares/**/*.middleware.{ts,js}')],
    defaultErrorHandler: false,
  });

  // Inicia o servidor
  const PORT = serverConfig.port || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

bootstrap().catch(error => {
  console.error('Erro ao iniciar o servidor:', error);
}); 