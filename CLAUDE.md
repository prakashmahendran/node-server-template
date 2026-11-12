# node-server-template

Starter project for new backend services built on `node-server-engine`. Running `node init.js` asks for a
name, description and debug namespace, replaces the `~~name~~`, `~~description~~` and `~~namespace~~`
placeholders, then deletes itself. Changes here only affect services generated from now on.

## Commands

Node.js >= 22 (the Docker image uses `node:22-slim`).

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server (nodemon) | `npm run dev` |
| Tests (mocha + nyc) | `npm test` |
| Lint | `npm run lint` |
| Type check | `npx tsc -p tsconfig.json --noEmit` |
| Build to `dist/` | `npm run build` |
| Start the built app | `npm start` |

## Layout (`src/`)

- `index.ts`: starts the server, then, if `RUN_DB_MIGRATION=true`, initializes Sequelize, registers the
  models and runs migrations, then starts Pub/Sub.
- `app/createServer.ts`: builds the engine `Server` (endpoints, Secret Manager config).
- `endpoints/<feature>/`: one folder per feature, for example `users`:
  - `users.ts`: `Endpoint` definitions (path, method, `authType`, validator, `middleware.checkPermission(...)`)
  - `users.handler.ts`, `users.validator.ts` (express-validator schema), `users.const.ts` (messages)
  - `users.docs.yaml` (swagger; add `security: - bearerAuth: []` on authenticated routes), `users.test.ts`
  - Export new endpoints from `endpoints/index.ts`.
- `db/models/`: sequelize-typescript models. `db/migrations/`: umzug migrations, timestamp-prefixed.
- `pubsub/`: Pub/Sub handlers and initialization.
- `test/`: mocha hooks and stubs. Tests use `sinon` and `backend-test-tools`.

## Security rules for endpoints

- Use `authType: EndpointAuthType.JWT` plus `checkPermission('<Action>')` for anything that isn't public.
  Add new permissions to the seed migration.
- Never return the password hash: `User.toJSON()` strips `password`. Use `attributes` in queries, and
  `raw: true` only where the hash is actually needed (login).
- Login gives the same 401 response for an unknown email and a wrong password, and rejects accounts whose
  `accountStatus` isn't `active`.
- 500 responses send only a message. Report the error with `reportError(error)` and never include it in
  the response body.
- The seeded admin (`admin@gmail.com`) is a placeholder. Change its password or remove it in every real
  service.
- Secrets come from env or Google Secret Manager. Never commit `.env` or `keys/`; both are git- and
  docker-ignored.

## Dependencies

- Uses `node-server-engine` 2.x (Node.js >= 22) and `backend-test-tools` (devDependency only).
- `overrides` pins Sequelize's `uuid` to a patched version.
- Check `npm audit --omit=dev` when updating dependencies; production should stay at 0 vulnerabilities.
