import { Sequelize } from 'sequelize';
import { defineModels } from './models.ts';
import { seedDatabase } from './seed.ts';

export function openDatabase(url: string): Sequelize {
  const sequelize = new Sequelize(url, { dialect: 'postgres', logging: false });
  defineModels(sequelize);
  return sequelize;
}

/** Empties the database, creates the tables from the models and inserts the sample cookbook. */
export async function resetDatabase(sequelize: Sequelize): Promise<void> {
  await sequelize.sync({ force: true });
  await seedDatabase();
}

/** False for a database that was never reset: it has no tables yet. */
export async function isInitialized(sequelize: Sequelize): Promise<boolean> {
  const [rows] = await sequelize.query('select to_regclass(\'public.recipes\') as found');
  return (rows[0] as { found: string | null } | undefined)?.found != null;
}
