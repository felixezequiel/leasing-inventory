# Database Implementation Guide

This project uses Sequelize ORM with SQLite for development and can be easily switched to PostgreSQL or MySQL for production.

## Setup

The database is automatically initialized when starting the server, but you can also initialize it manually:

```bash
npm run db:init
```

## Database Structure

- SQLite file-based database for development
- Can be switched to PostgreSQL or MySQL for production by changing the configuration
- The database is automatically created if it doesn't exist

## Available Scripts

- `npm run db:init` - Initialize the database, run migrations and seeds
- `npm run db:migrate` - Run all pending migrations
- `npm run db:migrate:undo` - Revert the most recent migration
- `npm run db:migrate:undo:all` - Revert all migrations
- `npm run db:seed:all` - Run all seeders
- `npm run db:seed:undo:all` - Revert all seeders

## Configuration

Database configuration is stored in `src/infra/database/sequelize/config/config.ts` and can be overridden with environment variables:

- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_HOST` - Database host
- `DB_DIALECT` - Database dialect (mysql, postgres, sqlite)

## Entity Relationships

Current entities:
- `User` - User account information
- `RefreshToken` - Refresh tokens for authentication

## Creating New Migrations

To create a new migration:

1. Create a new file in `src/infra/database/sequelize/migrations` with a timestamp prefix (e.g., `20240101000002-create-new-table.ts`)
2. Define the `up` and `down` methods for creating and dropping the table

Example:

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('table_name', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Other fields...
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('table_name');
  },
};
```

## Creating New Models

1. Create a new file in `src/infra/database/sequelize/models` (e.g., `NewModel.ts`)
2. Define the model's attributes and configuration
3. Update the `models/index.ts` file to export the new model

## Creating New Repositories

1. Create an interface in `src/domain/interfaces/repositories` (e.g., `NewModelRepository.ts`)
2. Implement the repository in `src/data/repositories` (e.g., `NewModelRepositoryImpl.ts`)
3. Update the `RepositoryFactory` to provide access to the new repository

## Changing Database Dialect

To switch to a different database, update the configuration in `src/infra/database/sequelize/config/config.ts` and install the required dependencies:

For PostgreSQL:
```bash
npm install pg pg-hstore --save
```

For MySQL:
```bash
npm install mysql2 --save
``` 