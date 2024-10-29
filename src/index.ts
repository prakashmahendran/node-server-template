import {reportError} from 'node-server-engine';
import {createServer} from 'app';

createServer()
  .init()
  .catch((e) => {
    reportError(e);
    process.exit(1);
  });
