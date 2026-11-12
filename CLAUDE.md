# node-server-template

Starter project for new backend services built on `node-server-engine`. Running `node init.js` asks for a
name, description and debug namespace, replaces the `~~name~~`, `~~description~~` and `~~namespace~~`
placeholders, then deletes itself. Changes here only affect services generated from now on.

## Commands

Node.js >= 22 (the Docker image uses `node:22-slim`).

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server (nodemon + ts-node) | `npm run dev` |
| Tests (mocha + nyc, SQLite in memory) | `npm test` |
| Lint | `npm run lint` |
| Type check | `npx tsc -p tsconfig.json --noEmit` |
| Build to `dist/` (tsc + tsc-alias + `scripts/copy-assets.js` for yaml docs) | `npm run build` |
| Start the built app | `npm start` |

The production build uses `tsc` rather than Babel: Babel's legacy decorator transform turns model fields
into own properties that hide Sequelize attribute values. Babel is still used by the tests (nyc).

## Layout (`src/`)

- `index.ts`: starts the server, then, if `RUN_DB_MIGRATION=true`, initializes Sequelize, registers the
  models and runs migrations (from `dist/db/migrations/*.js` when built), then starts Pub/Sub.
- `app/createServer.ts`: builds the engine `Server` (endpoints, Secret Manager config).
- `endpoints/<feature>/`: one folder per feature. `<feature>.ts` (routes), `.validator.ts`,
  `.handler.ts`, `.const.ts`, `.docs.yaml` (swagger), `.test.ts`. Export from `endpoints/index.ts`.
- `db/models/`: sequelize-typescript models. `db/migrations/`: umzug migrations, timestamp-prefixed.
  `db/transaction.ts`: `withTransaction(work)` for atomic multi-step writes.
- `pubsub/`: Pub/Sub handlers and initialization.
- `test/`: mocha hooks and stubs. Tests use `sinon` and `backend-test-tools`.

## Rules

- **Models:** declare decorated attributes with `declare` (`@Column(...) declare name: string;`). A plain
  `name!: string` field shadows the Sequelize getter, so the value reads as `undefined`.
- **Auth:** non-public routes use `EndpointAuthType.JWT` plus `checkPermission('<Action>')`. Add new
  permissions through a migration.
- **Validation:** every route has a validator, including `params`. Check types, lengths, enums and that
  referenced rows exist, so bad input returns 400 and never reaches the database as an error.
- **Writes:** validate before the first write. Wrap a write and its `Audit.create` in `withTransaction`,
  and pass `{ transaction }` to every query. Audit rows use `previousData` / `newData` with explicit fields.
- **Data exposure:** never return the password hash (`User.toJSON()` strips it; queries use
  `attributes: { exclude: ['password'] }`). 500 responses send only a message; report errors with
  `reportError(error)`.
- **Login:** gives the same 401 for an unknown email and a wrong password, and rejects accounts whose
  `accountStatus` isn't `active`.
- **Secrets:** come from env or Google Secret Manager; never commit `.env`, `keys/` or passwords. The
  initial admin is created by the seed migration only when `ADMIN_EMAIL` / `ADMIN_PASSWORD` are set.

## Claude agents (`.claude/agents/`)

- `endpoint-builder`: add or extend endpoints following the rules above.
- `db-migration-writer`: models, migrations and seed data.
- `security-reviewer`: review a diff for auth, validation, data exposure, secrets and dependency issues.

## Dependencies

- Uses `node-server-engine` 2.x and `backend-test-tools` (devDependency only).
- `overrides` pins Sequelize's `uuid` to a patched version.
- Keep `npm audit --omit=dev` at 0 vulnerabilities when updating packages.
