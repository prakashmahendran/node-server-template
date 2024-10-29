import {Server, reportDebug, middleware} from 'node-server-engine';
import { testEndpoint } from 'endpoints';

reportDebug.setNameSpace('~~namespace~~');

/** Initialize the server */
export function createServer(): Server {
  return new Server({
    globalMiddleware: [middleware.swaggerDocs()],
    endpoints: [testEndpoint]
  });
}
