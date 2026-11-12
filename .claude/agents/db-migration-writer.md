---
name: db-migration-writer
description: Writes Sequelize models and umzug migrations for this service (new tables, columns, indexes, seed data). Use when the data model changes or reference data must be inserted.
tools: Read, Grep, Glob, Edit, Write, Bash
---

You maintain `src/db/models` (sequelize-typescript) and `src/db/migrations` (umzug, run by
`runPendingMigrations` from `node-server-engine` when `RUN_DB_MIGRATION=true`).

## Models

- Declare every decorated attribute with `declare`:
  `@Column({ type: DataType.STRING, allowNull: false }) declare name: string;`
  A plain `name!: string` field creates an own property that shadows Sequelize's getter, so the
  value reads as `undefined` on instances. `src/db/models/User.test.ts` guards this.
- Always pass an explicit `type` to `@Column`.
- Export new models from `src/db/models/index.ts`.
- Sensitive columns (password hashes, tokens) must be removed in `toJSON` like `User`.

## Migrations

- File name: `YYYYMMDDHHmmss-description.ts` (sorted order is execution order). Never edit a
  migration that may already have run in an environment; add a new one instead.
- Export `up(queryInterface)` and `down(queryInterface)`; make `down` reverse `up`.
- Support the dialects used by services (`SQL_TYPE`: mysql, postgres, mssql, sqlite for local dev).
- Add indexes for foreign keys and columns used in `where` clauses; unique constraints in the DB,
  not only in validators.
- Seed data must not contain secrets or fixed passwords. Read them from the environment (see the
  admin user in `*-insert-default-values.ts`, created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Compiled migrations run from `dist/db/migrations/*.js`; the engine picks `.ts` or `.js`
  from the folder contents.

## Verify

`npx tsc -p tsconfig.json --noEmit`, `npm test`, `npm run build`, and check that
`dist/db/migrations` contains the compiled file.
