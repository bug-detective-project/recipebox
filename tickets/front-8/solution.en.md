# Solution: Draw the list that was computed

**Root cause.** In `client/src/components/IngredientList.tsx`, when the servings differ from the recipe's, each ingredient is looked up with `scaled.find((item) => (item.id = ingredient.id))`. The single `=` assigns the id and returns it, a truthy value, so `find` always returns the first scaled item.

## Step by step

1. **Reproduce it.** Open a recipe and press **+**: every line is the first ingredient.
2. **Find where the lines come from.** `IngredientList` draws `shown`, built with a `find` over `scaled`.
3. **Read the condition of the `find`.** `item.id = ingredient.id` is an assignment.
4. **Draw `scaled` itself.** It already has one item per ingredient, in order.

   ```tsx
   export function IngredientList({ ingredients, recipeServings, servings }: { ingredients: Ingredient[]; recipeServings: number; servings: number }) {
     const scaled = scaleIngredients(ingredients, recipeServings, servings);

     if (ingredients.length === 0) {
       return <p className="text-muted">No ingredients yet.</p>;
     }
     return (
       <ul className="flex flex-col divide-y divide-border">
         {scaled.map((ingredient) => (
           <li key={ingredient.id} className="flex items-baseline gap-3 py-2.5 before:size-1.5 before:shrink-0 before:-translate-y-0.5 before:rounded-full before:bg-accent" data-testid="ingredient">
             {describeIngredient(ingredient)}
           </li>
         ))}
       </ul>
     );
   }
   ```

The reference also adds a regression test, `client/src/components/IngredientList.test.tsx`: the list for the recipe's servings, for more and for fewer, the ingredients it was given left untouched, and the buttons of the recipe page.

Then run `npm test`, press **+** and **−** on a recipe, and move the card to **In QA**.
