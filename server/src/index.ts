import { createApp } from './app.ts';
import { databaseUrl, port } from './config.ts';
import { isInitialized, openDatabase, resetDatabase } from './db.ts';

const sequelize = openDatabase(databaseUrl());
// The first start on a new database: create the tables and the sample cookbook.
if (!(await isInitialized(sequelize))) {
  await resetDatabase(sequelize);
}
const app = createApp(sequelize, { logger: true });

await app.listen({ port, host: '0.0.0.0' });
