import type { Ingredient } from '../api/types.ts';
import { describeIngredient, scaleIngredients } from '../utils/scale.ts';

/** The ingredients of a recipe, with the quantities for the servings the cook wants. */
export function IngredientList({ ingredients, recipeServings, servings }: { ingredients: Ingredient[]; recipeServings: number; servings: number }) {
  const scaled = scaleIngredients(ingredients, recipeServings, servings);

  if (ingredients.length === 0) {
    return <p className="text-muted">No ingredients yet.</p>;
  }
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5">
      {scaled.map((ingredient) => (
        <li key={ingredient.id} data-testid="ingredient">
          {describeIngredient(ingredient)}
        </li>
      ))}
    </ul>
  );
}
