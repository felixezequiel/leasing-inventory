import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage, MigrationParams } from 'umzug';
import path from 'path';
import sequelize from './index';

interface MigrationContext {
  queryInterface: any;
  sequelize: Sequelize;
}

export const migrator = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations', '*.ts'),
    resolve: ({ name, path, context }: { 
      name: string; 
      path?: string; 
      context: MigrationContext 
    }) => {
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context.queryInterface, context.sequelize),
        down: async () => migration.down(context.queryInterface, context.sequelize),
      };
    },
  },
  context: {
    queryInterface: sequelize.getQueryInterface(),
    sequelize,
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export type Migrator = typeof migrator;

export const runMigrations = async () => {
  try {
    await migrator.up();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

export const rollbackMigration = async () => {
  try {
    await migrator.down();
    console.log('Migration rollback completed successfully');
  } catch (error) {
    console.error('Error rolling back migration:', error);
    throw error;
  }
}; 