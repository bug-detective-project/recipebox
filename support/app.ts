import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import type { APIRequestContext, Locator, Page } from '@playwright/test';

export interface RatingSummary {
  average: number | null;
  count: number;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published';
  servings: number;
  prepMinutes: number;
  photo: { url: string; caption: string } | null;
  rating: RatingSummary;
  favorite: boolean;
}

export interface RecipeDetail extends Recipe {
  ingredients: { id: number; name: string; quantity: number; unit: string }[];
  steps: { id: number; text: string }[];
}

export interface RecipeInput {
  title: string;
  description: string;
  category: string;
  servings: number;
  prepTime: string;
  photo: { url: string; caption: string } | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: string[];
}

/** Ids of the sample cookbook every QA run starts with (`npm run db:reset`). */
export const SAMPLE = {
  pancakes: 1,
  oats: 2,
  /** Published, without a photo. */
  pasta: 3,
  /** Published, 90 minutes, 6 servings. */
  chicken: 4,
  curry: 5,
  mugCake: 6,
  /** Published, 80 minutes, without a photo. */
  lemonTart: 7,
  hummus: 8,
  /** Published, without a photo and without ratings. */
  toastie: 9,
  mintTea: 10,
  /** A draft, 200 minutes. */
  stewDraft: 11,
  custardDraft: 12,
} as const;

/** The titles of the sample cookbook, in the order of the list (by title). */
export const SAMPLE_TITLES = [
  'Banana Pancakes',
  'Cheese Toastie',
  'Chocolate Mug Cake',
  'Egg Custard',
  'Garlic Butter Pasta',
  'Hummus',
  'Iced Mint Tea',
  'Lemon Tart',
  'Overnight Oats',
  'Roast Chicken with Lemon',
  'Slow Beef Stew',
  'Vegetable Curry',
];

type Query = Record<string, string | number | boolean>;

let counter = 0;
/** A title no other recipe of this run has. */
export const uniqueTitle = (label: string): string => `${label} ${Date.now().toString(36)}${(counter += 1)}`;

/** A recipe the API accepts; a test changes only the fields it is about. */
export function recipeInput(overrides: Partial<RecipeInput> = {}): RecipeInput {
  return {
    title: uniqueTitle('QA Soup'),
    description: 'Made by the QA suite.',
    category: 'main',
    servings: 4,
    prepTime: '30 min',
    photo: null,
    ingredients: [
      { name: 'tomato', quantity: 800, unit: 'g' },
      { name: 'onion', quantity: 1, unit: '' },
    ],
    steps: ['Simmer everything for twenty minutes.', 'Blend until smooth.'],
    ...overrides,
  };
}

/** GET /api/recipes with these filters. */
export async function listRecipes(request: APIRequestContext, params: Query = {}): Promise<Recipe[]> {
  const response = await request.get('/api/recipes', { params });
  expect(response.status(), `GET /api/recipes ${JSON.stringify(params)}`).toBe(200);
  return response.json();
}

export async function getRecipe(request: APIRequestContext, id: number): Promise<RecipeDetail> {
  const response = await request.get(`/api/recipes/${id}`);
  expect(response.status(), `GET /api/recipes/${id}`).toBe(200);
  return response.json();
}

/** Creates a draft through the API. */
export async function createRecipe(request: APIRequestContext, overrides: Partial<RecipeInput> = {}): Promise<RecipeDetail> {
  const response = await request.post('/api/recipes', { data: recipeInput(overrides) });
  expect(response.status(), `POST /api/recipes: ${await response.text()}`).toBe(201);
  return response.json();
}

/** Creates a recipe through the API and publishes it. */
export async function createPublished(request: APIRequestContext, overrides: Partial<RecipeInput> = {}): Promise<RecipeDetail> {
  const draft = await createRecipe(request, overrides);
  const response = await request.post(`/api/recipes/${draft.id}/publish`);
  expect(response.status(), `POST /api/recipes/${draft.id}/publish`).toBe(200);
  return response.json();
}

/** Opens the list of recipes (with a query string such as "?q=tart") and waits for it. */
export async function openList(page: Page, search = ''): Promise<void> {
  await page.goto(`/${search}`);
  await expect(page.getByTestId('recipe-count')).toBeVisible();
}

/** The card of the list that shows this recipe. */
export function cardOf(page: Page, title: string): Locator {
  return page.getByTestId('recipe-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

/** The titles of the cards on screen, in order. */
export function titlesShown(page: Page): Promise<string[]> {
  return page.getByTestId('recipe-card').getByRole('heading').allTextContents();
}

/** Opens the page of a recipe and waits for its title. */
export async function openRecipe(page: Page, id: number, title: string): Promise<void> {
  await page.goto(`/recipes/${id}`);
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
}

/** The ingredient lines of the recipe page, in order. */
export function ingredientsShown(page: Page): Promise<string[]> {
  return page.getByTestId('ingredient').allTextContents();
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where an element is on the page; fails when it is not rendered. */
export async function boxOf(locator: Locator, what: string): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box, `${what} must be on the page`).not.toBeNull();
  return box!;
}

/** Waits until the browser has rendered at least two more frames. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

/** The JSON lines the API wrote to its output so far (other lines, such as the start-up one, are left out). */
export function serverLog(): Record<string, unknown>[] {
  const file = process.env.QA_SERVER_LOG;
  if (!file) {
    throw new Error('QA_SERVER_LOG must be set. Run the suite through `npm run qa`.');
  }
  return readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((line) => {
      try {
        const parsed: unknown = JSON.parse(line);
        return typeof parsed === 'object' && parsed !== null ? [parsed as Record<string, unknown>] : [];
      } catch {
        return [];
      }
    });
}
