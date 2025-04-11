import { connectDatabase } from './sequelize';
import { runMigrations } from './sequelize/migrator';

export async function initializeDatabase(): Promise<void> {
  try {
    // Connect to the database
    await connectDatabase();
    
    // Run migrations
    await runMigrations();
    
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