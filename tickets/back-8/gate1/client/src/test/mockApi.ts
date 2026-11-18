import { vi } from 'vitest';
import type { RatingSummary, RecipeDetail, RecipeInput } from '../api/types.ts';

function recipe(id: number, title: string, overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return {
    id,
    title,
    description: `About ${title}.`,
    category: 'main',
    status: 'published',
    servings: 4,
    prepMinutes: 30,
    photo: null,
    rating: { average: null, count: 0 },
    favorite: false,
    ingredients: [
      { id: id * 10 + 1, name: 'flour', quantity: 200, unit: 'g' },
      { id: id * 10 + 2, name: 'egg', quantity: 2, unit: '' },
      { id: id * 10 + 3, name: 'milk', quantity: 300, unit: 'ml' },
    ],
    steps: [
      { id: id * 10 + 1, text: `Mix everything for ${title}.` },
      { id: id * 10 + 2, text: 'Cook until golden.' },
    ],
    ...overrides,
  };
}

export function createTestRecipes(): RecipeDetail[] {
  return [
    recipe(1, 'Banana Pancakes', { category: 'breakfast', prepMinutes: 25, photo: { url: '/images/banana-pancakes.svg', caption: 'A stack of pancakes' }, rating: { average: 4.7, count: 3 }, favorite: true }),
    recipe(2, 'Garlic Butter Pasta', { prepMinutes: 20, rating: { average: 5, count: 1 } }),
    recipe(3, 'Lemon Tart', { category: 'dessert', prepMinutes: 80, servings: 8 }),
    recipe(4, 'Slow Beef Stew', { status: 'draft', prepMinutes: 200, ingredients: [{ id: 41, name: 'beef', quantity: 800, unit: 'g' }] }),
  ];
}

export interface MockRequest {
  method: string;
  path: string;
  search: URLSearchParams;
  headers: Record<string, string>;
  body: unknown;
}

export interface MockApiOptions {
  recipes?: RecipeDetail[];
  /** Return a response to override the default handling of a request. */
  respond?: (request: MockRequest) => Response | undefined | Promise<Response | undefined>;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const PREP_TIME = /^(?:(\d+)h)?\s*(?:(\d+)\s*(?:min)?)?$/;

function fromInput(input: RecipeInput, id: number): Partial<RecipeDetail> {
  const [, hours, minutes] = PREP_TIME.exec(input.prepTime.trim()) ?? [];
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    servings: input.servings,
    prepMinutes: Number(hours ?? 0) * 60 + Number(minutes ?? 0),
    photo: input.photo,
    ingredients: input.ingredients.map((ingredient, index) => ({ id: id * 100 + index, ...ingredient })),
    steps: input.steps.map((text, index) => ({ id: id * 100 + index, text })),
  };
}

/**
 * Replaces fetch with a small in-memory copy of the API: the list filters like the real one and
 * the changes stay. `requests` records every call the client made.
 */
export function mockApi(options: MockApiOptions = {}) {
  const recipes = options.recipes ?? createTestRecipes();
  const requests: MockRequest[] = [];

  const handle = (request: MockRequest): Response => {
    const { method, path, search } = request;
    if (method === 'GET' && path === '/api/recipes') {
      const q = (search.get('q') ?? '').toLowerCase();
      const category = search.get('category');
      const ingredient = (search.get('ingredient') ?? '').toLowerCase();
      const matching = recipes
        .filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
        .filter((item) => !category || item.category === category)
        .filter((item) => item.ingredients.some((part) => part.name.toLowerCase().includes(ingredient)))
        .filter((item) => search.get('favorites') !== 'true' || item.favorite)
        .sort((a, b) => a.title.localeCompare(b.title));
      return json(matching.map(({ ingredients: _ingredients, steps: _steps, ...summary }) => summary));
    }
    if (method === 'POST' && path === '/api/recipes') {
      const id = Math.max(0, ...recipes.map((item) => item.id)) + 1;
      const created = recipe(id, '', { status: 'draft', ...fromInput(request.body as RecipeInput, id) });
      recipes.push(created);
      return json(created, 201);
    }
    const [, resource, rawId, action] = /^\/api\/(recipes|favorites)\/(\d+)(?:\/(\w+))?$/.exec(path) ?? [];
    const found = recipes.find((item) => item.id === Number(rawId));
    if (!resource || !found) {
      return json({ error: path.startsWith('/api/recipes/') || path.startsWith('/api/favorites/') ? 'Recipe not found' : 'Not found' }, 404);
    }
    if (resource === 'favorites' && (method === 'PUT' || method === 'DELETE')) {
      found.favorite = method === 'PUT';
      return new Response(null, { status: 204 });
    }
    if (method === 'GET' && !action) {
      return json(found);
    }
    if (method === 'PUT' && !action) {
      Object.assign(found, fromInput(request.body as RecipeInput, found.id));
      return json(found);
    }
    if (method === 'DELETE' && !action) {
      recipes.splice(recipes.indexOf(found), 1);
      return new Response(null, { status: 204 });
    }
    if (method === 'POST' && action === 'publish') {
      found.status = 'published';
      return json(found);
    }
    if (method === 'POST' && action === 'ratings') {
      const { stars } = request.body as { stars: number };
      const { average, count } = found.rating;
      const rating: RatingSummary = { average: Math.round((((average ?? 0) * count + stars) / (count + 1)) * 10) / 10, count: count + 1 };
      found.rating = rating;
      return json(rating, 201);
    }
    return json({ error: 'Not found' }, 404);
  };

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), 'http://localhost');
      const request: MockRequest = {
        method: init?.method ?? 'GET',
        path: url.pathname,
        search: url.searchParams,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      };
      requests.push(request);
      return (await options.respond?.(request)) ?? handle(request);
    }),
  );

  return { recipes, requests };
}
