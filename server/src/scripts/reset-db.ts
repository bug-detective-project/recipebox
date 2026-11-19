import { databaseUrl } from '../config.ts';
import { openDatabase, resetDatabase } from '../db.ts';

/** The message of the first error in the chain: the driver's own, under the query that failed. */
function rootMessage(error: unknown): string {
  let current = error;
  while (current instanceof Error && current.cause instanceof Error) {
    current = current.cause;
  }
  if (current instanceof AggregateError) {
    return current.errors.map((item: Error) => item.message).join('; ');
  }
  const message = current instanceof Error ? current.message || (current as NodeJS.ErrnoException).code : String(current);
  return (message ?? 'unknown error').split('\n')[0]!;
}

const sequelize = openDatabase(databaseUrl());
try {
  await resetDatabase(sequelize);
  console.log('Database reset: the sample cookbook is back.');
} catch (error) {
  // The usual cause is a database that is not running, not a bug in the app: say only that.
  const reason = rootMessage(error);
  console.error(`Could not reset the database: ${reason}`);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
