import {
  reportError,
  reportInfo,
  sequelize,
  runPendingMigrations
} from 'node-server-engine';
import { createServer } from 'app';
import * as models from 'db/models';

createServer()
  .init()
  .then(async () => {
    await sequelize.init();
    const modelArray = Object.values(models);
    await sequelize.addModels(modelArray);
    if(process.env.RUN_DB_MIGRATION?.toLowerCase()==='true'){
      reportInfo('Database migration started');
      await runPendingMigrations();
    }
  })
  .catch((e) => {
    reportError(e);
    process.exit(1);
  });
