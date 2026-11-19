import type { FastifyInstance } from 'fastify';
import type { Sequelize } from 'sequelize';
import { afterAll, beforeEach } from 'vitest';
import { createApp } from '../app.ts';
import { resetDatabase } from '../db.ts';
import type { RecipeInput } from '../recipes.ts';
import { testDatabase } from './database.ts';

export interface Answer<Body> {
  status: number;
  body: Body;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Headers = Record<string, string>;

export interface TestApi {
  app: () => FastifyInstance;
  /** What the server logged, one parsed JSON line per item. */
  log: Record<string, unknown>[];
  get<Body = unknown>(url: string): Promise<Answer<Body>>;
  post<Body = unknown>(url: string, payload?: unknown, headers?: Headers): Promise<Answer<Body>>;
  put<Body = unknown>(url: string, payload?: unknown, headers?: Headers): Promise<Answer<Body>>;
  delete<Body = unknown>(url: string, headers?: Headers): Promise<Answer<Body>>;
}

/** The API over the test database, with the sample cookbook back before every test of the file. */
export function useApi(): TestApi {
  let sequelize: Sequelize | undefined;
  let app: FastifyInstance;
  const log: Record<string, unknown>[] = [];

  beforeEach(async () => {
    if (sequelize) {
      await resetDatabase(sequelize);
    } else {
      sequelize = await testDatabase();
      app = createApp(sequelize, { logger: { write: (line) => log.push(JSON.parse(line) as Record<string, unknown>) } });
    }
    log.length = 0;
  });

  afterAll(async () => {
    await sequelize?.close();
  });

  async function call<Body>(method: Method, url: string, payload?: unknown, headers: Headers = {}): Promise<Answer<Body>> {
    const response = await app.inject({ method, url, payload: payload as object | undefined, headers: { host: 'localhost:3001', ...headers } });
    return { status: response.statusCode, body: (response.body === '' ? undefined : response.json()) as Body };
  }

  return {
    app: () => app,
    log,
    get: (url) => call('GET', url),
    post: (url, payload, headers) => call('POST', url, payload, headers),
    put: (url, payload, headers) => call('PUT', url, payload, headers),
    delete: (url, headers) => call('DELETE', url, undefined, headers),
  };
}

/** A recipe the API accepts; a test changes only the fields it is about. */
export function recipeInput(overrides: Partial<RecipeInput> = {}): RecipeInput {
  return {
    title: 'Tomato Soup',
    description: 'Red, warm and quick.',
    category: 'main',
    servings: 4,
    prepTime: '30 min',
    ingredients: [
      { name: 'tomato', quantity: 800, unit: 'g' },
      { name: 'onion', quantity: 1 },
    ],
    steps: ['Simmer everything for twenty minutes.', 'Blend until smooth.'],
    ...overrides,
  };
}
