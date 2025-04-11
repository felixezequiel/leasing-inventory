import 'reflect-metadata';
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Importa a configuração do servidor
import { serverConfig } from '@infra/config/server.config';
import { AuthMiddleware } from './presentation/middlewares/auth.middleware';

async function bootstrap() {
  // Cria a instância do Express
  const app = express();

  // Middlewares globais
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());

  // Configura o routing-controllers
  useExpressServer(app, {
    controllers: [path.join(__dirname, 'presentation/controllers/**/*.{ts,js}')],
    middlewares: [AuthMiddleware],
    defaultErrorHandler: false,
  });

  // Inicia o servidor
  const PORT = serverConfig.port || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

bootstrap().catch(console.error); 