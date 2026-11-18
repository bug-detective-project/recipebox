import { describe, expect, it } from 'vitest';
import type { RecipeSummary } from './recipes.ts';
import { useApi } from './test/api.ts';

const api = useApi();

const list = async (query: string) => (await api.get<RecipeSummary[]>(`/api/recipes?${query}`)).body.map((recipe) => recipe.title);

describe('the ingredient filter together with the other filters', () => {
  it('alone, lists every recipe with the ingredient', async () => {
    expect(await list('ingredient=egg')).toEqual(['Banana Pancakes', 'Chocolate Mug Cake', 'Egg Custard', 'Lemon Tart']);
  });

  it('keeps the category', async () => {
    expect(await list('ingredient=egg&category=dessert')).toEqual(['Chocolate Mug Cake', 'Egg Custard', 'Lemon Tart']);
    expect(await list('ingredient=egg&category=breakfast')).toEqual(['Banana Pancakes']);
    expect(await list('ingredient=egg&category=drink')).toEqual([]);
  });

  it('keeps the search', async () => {
    expect(await list('ingredient=garlic')).toEqual(['Garlic Butter Pasta', 'Hummus', 'Roast Chicken with Lemon', 'Vegetable Curry']);
    expect(await list('ingredient=garlic&q=chicken')).toEqual(['Roast Chicken with Lemon']);
  });

  it('keeps the category and the search at once', async () => {
    expect(await list('ingredient=lemon&category=main&q=sunday')).toEqual(['Roast Chicken with Lemon']);
    expect(await list('ingredient=lemon&category=dessert&q=sunday')).toEqual([]);
  });

  it('answers an empty list for an ingredient no recipe has, whatever the category', async () => {
    expect(await list('ingredient=saffron&category=main')).toEqual([]);
  });
});
