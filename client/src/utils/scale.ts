import type { Ingredient } from '../api/types.ts';

/** The ingredients for another number of servings: every quantity grows or shrinks alike. */
export function scaleIngredients(ingredients: Ingredient[], recipeServings: number, wantedServings: number): Ingredient[] {
  const factor = wantedServings / recipeServings;
  return ingredients.map((ingredient) => ({ ...ingredient, quantity: ingredient.quantity * factor }));
}

/** A quantity with at most two decimal places and no trailing zeros: 1.5, 0.33, 200. */
export function formatQuantity(quantity: number): string {
  return String(Math.round(quantity * 100) / 100);
}

/** "200 g flour", "2 egg". */
export function describeIngredient({ quantity, unit, name }: Ingredient): string {
  return [formatQuantity(quantity), unit, name].filter(Boolean).join(' ');
}
