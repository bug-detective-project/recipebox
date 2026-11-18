# Solution: The favorites, finished

**What was missing.** In `server/src/recipes.ts`, `getRecipe` answered `favorite: false` for every recipe, and `listRecipes` did not filter by favorites; the route in `server/src/routes/recipes.ts` answered 501 for `favorites=true`. The table, the model, the two routes of `/api/favorites` and the mark of the list already worked.

## Step by step

1. **Find the unfinished places.** Two `TODO` notes: in `getRecipe` and in the route of the list.
2. **Answer the real mark of a recipe.** In `getRecipe`, use the helper the list uses:

   ```ts
   return {
     ...summaryOf(recipe, rating, (await favoriteIds()).has(recipe.id)),
     ingredients: recipe.ingredients!.map(({ id: ingredientId, name, quantity, unit }) => ({ id: ingredientId, name, quantity, unit })),
     steps: recipe.steps!.map(({ id: stepId, text }) => ({ id: stepId, text })),
   };
   ```

3. **Filter the list.** In `listRecipes`, after the ingredient filter and before `ids` goes into the `where`:

   ```ts
   if (filters.favorites) {
     ids = (ids ?? [...favorites]).filter((id) => favorites.has(id));
   }
   if (ids) {
     where.id = ids;
   }
   ```

4. **Remove the 501** from the route, so the request reaches `listRecipes`:

   ```ts
   app.get<{ Querystring: ListFilters }>('/api/recipes', { schema: { querystring: listQuery } }, (request) => {
     return listRecipes(request.query);
   });
   ```

The reference also adds a test, `server/src/favorites.test.ts`: the mark on the recipe following the `PUT` and the `DELETE`, taking away a mark that is not there, a recipe that does not exist, and the filter alone and together with the ingredient filter.

Then run `npm test`, try the heart on a recipe page and **Only favorites** on the list, and move the card to **In QA**.
