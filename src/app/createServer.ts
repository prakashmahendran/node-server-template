import {Server, reportDebug, middleware, SecretManagerOptions} from 'node-server-engine';
import * as endpoints from 'endpoints';

reportDebug.setNameSpace('~~namespace~~');

/** Initialize the server */
export function createServer(): Server {
  // Optional: Configure Secret Manager for production
  // Uncomment and customize the secrets array based on your service needs
  const secretManagerConfig: SecretManagerOptions = {
    enabled: process.env.NODE_ENV === 'production',
    projectId: process.env.GCP_PROJECT_ID,
    cache: true,
    fallbackToEnv: true,
    secrets: [
      // Example: Load string secrets directly as environment variables
      // 'SQL_PASSWORD',
      // 'JWT_SECRET',
      
      // Example: Load file-based secrets (keys, certificates, etc.)
      // {
      //   name: 'PRIVATE_KEY',
      //   type: 'file',
      //   targetEnvVar: 'PRIVATE_KEY_PATH',
      //   filename: 'private-key.pem'
      // },
      // {
      //   name: 'JWKS',
      //   type: 'file',
      //   targetEnvVar: 'JWKS_PATH',
      //   filename: 'jwks.json'
      // }
    ]
  };

  return new Server({
    globalMiddleware: [middleware.swaggerDocs()],
    endpoints: Object.values(endpoints),
    // Uncomment to enable Secret Manager
     secretManager: secretManagerConfig
  });
}
