#!/usr/bin/env ts-node

import 'reflect-metadata';
import { initializeDatabase } from '../infra/database/init-db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Initializing database...');

initializeDatabase()
  .then(() => {
    console.log('Database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }); 