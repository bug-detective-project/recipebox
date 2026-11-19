import pg from 'pg';
import type { Sequelize } from 'sequelize';
import { databaseUrl } from '../config.ts';
import { openDatabase, resetDatabase } from '../db.ts';

/** The tests never touch the database of DATABASE_URL: they use this one, on the same server. */
export const TEST_DATABASE = 'recipebox_test';

async function ensureTestDatabase(): Promise<string> {
  const admin = new pg.Client({ connectionString: databaseUrl() });
  await admin.connect();
  try {
    const found = await admin.query('select 1 from pg_database where datname = $1', [TEST_DATABASE]);
    if (found.rowCount === 0) {
      await admin.query(`create database ${TEST_DATABASE}`);
    }
  } finally {
    await admin.end();
  }
  const url = new URL(databaseUrl());
  url.pathname = `/${TEST_DATABASE}`;
  return url.toString();
}

/** The test database, freshly reset: open it in beforeAll or beforeEach and close it afterwards. */
export async function testDatabase(): Promise<Sequelize> {
  const sequelize = openDatabase(await ensureTestDatabase());
  await resetDatabase(sequelize);
  return sequelize;
}
