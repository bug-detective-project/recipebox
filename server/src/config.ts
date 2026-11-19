export const port = Number(process.env.PORT ?? 3001);

/**
 * The address of the database. The app that plays this project starts a PostgreSQL next to the
 * workspace and sets DATABASE_URL; nothing in the code knows a fixed address.
 */
export function databaseUrl(env: Record<string, string | undefined> = process.env): string {
  const url = env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set: the server needs the address of its PostgreSQL database');
  }
  return url;
}
