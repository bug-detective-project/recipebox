import { describe, expect, it } from 'vitest';
import { formatPrepTime } from './prepTime.ts';
import { describeIngredient, formatQuantity, scaleIngredients } from './scale.ts';

describe('formatPrepTime', () => {
  it.each([
    [5, '5 min'],
    [59, '59 min'],
    [60, '1h'],
    [90, '1h30'],
    [125, '2h05'],
  ])('writes %i minutes as %s', (minutes, text) => {
    expect(formatPrepTime(minutes)).toBe(text);
  });
});

describe('scaleIngredients', () => {
  const flour = { id: 1, name: 'flour', quantity: 200, unit: 'g' };

  it('keeps the quantities for the servings of the recipe', () => {
    expect(scaleIngredients([flour], 4, 4)).toEqual([flour]);
  });

  it('grows and shrinks the quantity with the servings', () => {
    expect(scaleIngredients([flour], 4, 6)[0]!.quantity).toBe(300);
    expect(scaleIngredients([flour], 4, 1)[0]!.quantity).toBe(50);
  });
});

describe('formatQuantity', () => {
  it.each([
    [200, '200'],
    [1.5, '1.5'],
    [1 / 3, '0.33'],
    [2.999, '3'],
  ])('writes %d as %s', (quantity, text) => {
    expect(formatQuantity(quantity)).toBe(text);
  });
});

describe('describeIngredient', () => {
  it('leaves out an empty unit', () => {
    expect(describeIngredient({ id: 1, name: 'egg', quantity: 2, unit: '' })).toBe('2 egg');
    expect(describeIngredient({ id: 2, name: 'flour', quantity: 200, unit: 'g' })).toBe('200 g flour');
  });
});
