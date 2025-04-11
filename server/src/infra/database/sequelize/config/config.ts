import { Dialect } from 'sequelize';

interface DbConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
  storage?: string;
  logging: boolean | ((sql: string, timing?: number) => void);
}

interface Config {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
}

const config: Config = {
  development: {
    username: 'root',
    password: '',
    database: 'leasing_inventory_dev',
    host: '127.0.0.1',
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  },
  test: {
    username: 'root',
    password: '',
    database: 'leasing_inventory_test',
    host: '127.0.0.1',
    dialect: 'sqlite',
    storage: './database.test.sqlite',
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'leasing_inventory_prod',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: (process.env.DB_DIALECT as Dialect) || 'mysql',
    logging: false
  }
};

export default config; 