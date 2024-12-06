import {
  reportError,
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
    if(process.env.DB_MIGRATION?.toLowerCase()==='true'){
      console.log('Db Migration Started');
      await runPendingMigrations();
    }
  })
  .catch((e) => {
    reportError(e);
    process.exit(1);
  });
