import { connectDatabase } from './sequelize';
import { runMigrations } from './sequelize/migrator';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function initializeDatabase(): Promise<void> {
  try {
    // Connect to the database
    await connectDatabase();
    
    // Run migrations
    await runMigrations();
    
    // Run seeders if in development
    if (process.env.NODE_ENV === 'development') {
      await execPromise('npm run db:seed:all');
      console.log('Database seeded successfully');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the script directly if called as a script
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
} 