import { sequelize, runPendingMigrations } from 'node-server-engine';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { useTestServer } from 'backend-test-tools';
import { createServer } from 'app/createServer';
import * as models from 'db/models';

chai.use(chaiAsPromised);
chai.use(sinonChai);

/**
 * Global test hooks: the server is created and initialised before the tests and shut down after them;
 * process.env and sinon stubs are restored around each test.
 */
export const testServer = useTestServer(createServer, {
  afterInit: async () => {
    await sequelize.init();
    sequelize.addModels(Object.values(models));
    if (process.env.RUN_DB_MIGRATION?.toLowerCase() === 'true') {
      await runPendingMigrations();
    }
  }
});

// Report unhandled errors instead of letting them pass silently
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
