import {
  reportError,
  reportInfo,
  sequelize,
  runPendingMigrations
} from 'node-server-engine';
import { createServer } from 'app';
import * as models from 'db/models';

// Handle unhandled promise rejections to prevent crashes from database issues
process.on('unhandledRejection', (reason) => {
  reportError('Unhandled Promise Rejection (process will continue)');
  reportError(reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  reportError('Uncaught Exception');
  reportError(error);
  // In production, you might want to exit gracefully here
  // but for Cloud Run health checks, we want to keep the server running
});


// Start the HTTP server first to pass Cloud Run health checks
createServer()
  .init()
  .then(async () => {
    reportInfo('HTTP server started successfully');
    
    // Only initialize database if explicitly enabled
    // This allows the server to start and pass health checks even without database
    const shouldInitDb = process.env.RUN_DB_MIGRATION?.toLowerCase() === 'true';
    
    if (shouldInitDb) {
      reportInfo('Database initialization enabled');
      try {
        await sequelize.init();
        const modelArray = Object.values(models);
        await sequelize.addModels(modelArray);
        reportInfo('Database migration started');
        await runPendingMigrations();
        reportInfo('Database initialized and migrations completed');
      } catch (dbError) {
        reportError('Database initialization failed');
        reportError(dbError);
        // Exit if database is required but failed
        process.exit(1);
      }
    } else {
      reportInfo('Database initialization skipped (RUN_DB_MIGRATION not set to true)');
    }
  })
  .catch((error) => {  
    reportError('Failed to start HTTP server');
    reportError(error);
    process.exit(1);
  });