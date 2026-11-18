import { describe, expect, it } from 'vitest';
import type { RatingSummary, RecipeDetail, RecipeSummary } from './recipes.ts';
import { SAMPLE_RECIPES } from './seed.ts';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

// Ids of the sample cookbook (the order of SAMPLE_RECIPES, from 1).
const PANCAKES = 1;
const OATS = 2;
const PASTA = 3;
const CHICKEN = 4;
const STEW_DRAFT = 11;

const titles = (recipes: RecipeSummary[]) => recipes.map((recipe) => recipe.title);

describe('GET /api/recipes', () => {
  it('lists every recipe by title', async () => {
    const { status, body } = await api.get<RecipeSummary[]>('/api/recipes');

    expect(status).toBe(200);
    expect(titles(body)).toEqual(SAMPLE_RECIPES.map((recipe) => recipe.title).sort());
  });

  it('gives the photo, the rating and the favorite mark of each one', async () => {
    const { body } = await api.get<RecipeSummary[]>('/api/recipes');

    expect(body.find((recipe) => recipe.id === PANCAKES)).toMatchObject({
      title: 'Banana Pancakes',
      category: 'breakfast',
      status: 'published',
      prepMinutes: 25,
      photo: { url: '/images/banana-pancakes.svg', caption: 'A stack of pancakes with banana slices on top' },
      rating: { average: 4.7, count: 3 },
      favorite: true,
    });
    expect(body.find((recipe) => recipe.id === PASTA)).toMatchObject({ photo: null, favorite: false });
    expect(body.find((recipe) => recipe.id === STEW_DRAFT)).toMatchObject({ status: 'draft', rating: { average: null, count: 0 } });
  });

  it('filters by category', async () => {
    const { body } = await api.get<RecipeSummary[]>('/api/recipes?category=breakfast');

    expect(titles(body)).toEqual(['Banana Pancakes', 'Overnight Oats']);
  });

  it('searches the title and the description, in any case', async () => {
    expect(titles((await api.get<RecipeSummary[]>('/api/recipes?q=OATS')).body)).toEqual(['Overnight Oats']);
    expect(titles((await api.get<RecipeSummary[]>('/api/recipes?q=sunday')).body)).toEqual(['Roast Chicken with Lemon']);
  });

  it('searches what the photo shows', async () => {
    expect(titles((await api.get<RecipeSummary[]>('/api/recipes?q=glass jar')).body)).toEqual(['Overnight Oats']);
  });

  it('reads % and _ in a search as plain characters', async () => {
    expect((await api.get<RecipeSummary[]>('/api/recipes?q=%25')).body).toEqual([]);
    expect((await api.get<RecipeSummary[]>('/api/recipes?q=_')).body).toEqual([]);
  });

  it('filters by ingredient', async () => {
    const { body } = await api.get<RecipeSummary[]>('/api/recipes?ingredient=honey');

    expect(titles(body)).toEqual(['Iced Mint Tea', 'Overnight Oats']);
  });

  it('refuses a category that does not exist', async () => {
    expect((await api.get('/api/recipes?category=brunch')).status).toBe(400);
  });
});

describe('GET /api/recipes/:id', () => {
  it('gives the ingredients and the steps in their order', async () => {
    const { status, body } = await api.get<RecipeDetail>(`/api/recipes/${OATS}`);

    expect(status).toBe(200);
    expect(body.title).toBe('Overnight Oats');
    expect(body.ingredients.map(({ name, quantity, unit }) => `${quantity} ${unit} ${name}`)).toEqual(['100 g rolled oats', '250 ml milk', '1 tbsp honey', '50 g berries']);
    expect(body.steps.map((step) => step.text)).toEqual(['Stir the oats, the milk and the honey in a jar.', 'Close the jar and leave it in the fridge overnight.', 'Top with the berries before serving.']);
  });

  it.each(['999', 'abc', '1.5'])('answers 404 for the id %s', async (id) => {
    expect(await api.get(`/api/recipes/${id}`)).toEqual({ status: 404, body: { error: 'Recipe not found' } });
  });
});

describe('POST /api/recipes', () => {
  it('creates a draft with its parts', async () => {
    const { status, body } = await api.post<RecipeDetail>('/api/recipes', recipeInput({ photo: { url: '/images/hummus.svg', caption: 'A red soup' } }));

    expect(status).toBe(201);
    expect(body).toMatchObject({
      title: 'Tomato Soup',
      description: 'Red, warm and quick.',
      category: 'main',
      status: 'draft',
      prepMinutes: 30,
      photo: { url: '/images/hummus.svg', caption: 'A red soup' },
      rating: { average: null, count: 0 },
      favorite: false,
    });
    expect(body.ingredients).toEqual([
      { id: expect.any(Number), name: 'tomato', quantity: 800, unit: 'g' },
      { id: expect.any(Number), name: 'onion', quantity: 1, unit: '' },
    ]);
    expect(body.steps.map((step) => step.text)).toEqual(['Simmer everything for twenty minutes.', 'Blend until smooth.']);
    expect((await api.get<RecipeDetail>(`/api/recipes/${body.id}`)).body).toEqual(body);
  });

  it.each([
    ['45', 45],
    ['1h30', 90],
    ['2h', 120],
  ])('reads the preparation time %j', async (prepTime, minutes) => {
    const { body } = await api.post<RecipeDetail>('/api/recipes', recipeInput({ prepTime }));

    expect(body.prepMinutes).toBe(minutes);
  });

  it('refuses a preparation time it cannot read', async () => {
    const { status, body } = await api.post('/api/recipes', recipeInput({ prepTime: 'a while' }));

    expect(status).toBe(400);
    expect(body).toEqual({ error: 'Some fields are not valid', fields: { prepTime: 'Write the time like 45 min or 1h30' } });
  });

  it('accepts a draft without ingredients or steps', async () => {
    const { status } = await api.post('/api/recipes', recipeInput({ ingredients: [], steps: [] }));

    expect(status).toBe(201);
  });
});

describe('PUT /api/recipes/:id', () => {
  it('saves the changes and replaces the parts', async () => {
    const { status, body } = await api.put<RecipeDetail>(
      `/api/recipes/${STEW_DRAFT}`,
      recipeInput({ title: 'Beef Stew', prepTime: '50 min', ingredients: [{ name: 'beef', quantity: 1, unit: 'kg' }], steps: ['Wait.'], photo: null }),
    );

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: STEW_DRAFT, title: 'Beef Stew', prepMinutes: 50, photo: null });
    expect(body.ingredients.map((ingredient) => ingredient.name)).toEqual(['beef']);
    expect(body.steps.map((step) => step.text)).toEqual(['Wait.']);
  });

  it('keeps a draft a draft', async () => {
    const { body } = await api.put<RecipeDetail>(`/api/recipes/${STEW_DRAFT}`, recipeInput());

    expect(body.status).toBe('draft');
  });

  it('answers 404 for a recipe that does not exist', async () => {
    expect((await api.put('/api/recipes/999', recipeInput())).status).toBe(404);
  });

  it('checks the body like the creation does', async () => {
    expect((await api.put(`/api/recipes/${STEW_DRAFT}`, recipeInput({ title: '' }))).status).toBe(400);
  });
});

describe('DELETE /api/recipes/:id', () => {
  it('removes the recipe and what belongs to it', async () => {
    expect((await api.delete(`/api/recipes/${CHICKEN}`)).status).toBe(204);

    expect((await api.get(`/api/recipes/${CHICKEN}`)).status).toBe(404);
    expect(titles((await api.get<RecipeSummary[]>('/api/recipes')).body)).not.toContain('Roast Chicken with Lemon');
  });
});

describe('POST /api/recipes/:id/publish', () => {
  it('publishes a draft', async () => {
    const { status, body } = await api.post<RecipeDetail>(`/api/recipes/${STEW_DRAFT}/publish`);

    expect(status).toBe(200);
    expect(body.status).toBe('published');
  });

  it('refuses a draft with nothing to cook', async () => {
    const created = await api.post<RecipeDetail>('/api/recipes', recipeInput({ ingredients: [] }));

    const { status } = await api.post(`/api/recipes/${created.body.id}/publish`);

    expect(status).toBe(409);
  });
});

describe('POST /api/recipes/:id/ratings', () => {
  it('adds a rating and answers the new average', async () => {
    const { status, body } = await api.post<RatingSummary>(`/api/recipes/${OATS}/ratings`, { stars: 1 });

    expect(status).toBe(201);
    expect(body).toEqual({ average: 3, count: 3 });
  });

  it.each([0, 6, 2.5, 'five'])('refuses %j stars', async (stars) => {
    expect((await api.post(`/api/recipes/${OATS}/ratings`, { stars })).status).toBe(400);
  });

  it('refuses to rate a draft', async () => {
    expect((await api.post(`/api/recipes/${STEW_DRAFT}/ratings`, { stars: 5 })).status).toBe(409);
  });
});

describe('favorites', () => {
  const favoriteOf = async (id: number) => (await api.get<RecipeSummary[]>('/api/recipes')).body.find((recipe) => recipe.id === id)!.favorite;

  it('marks a recipe, and marking twice is the same', async () => {
    expect((await api.put(`/api/favorites/${PASTA}`)).status).toBe(204);
    expect((await api.put(`/api/favorites/${PASTA}`)).status).toBe(204);

    expect(await favoriteOf(PASTA)).toBe(true);
  });

  it('answers 404 for a recipe that does not exist', async () => {
    expect((await api.put('/api/favorites/999')).status).toBe(404);
  });
});
