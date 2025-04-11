export const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  }
}; 