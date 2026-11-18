# Solution: An answer is not always a success

**Root cause.** `fetchRecipe` in `client/src/api/recipes.ts` calls `fetch` and never checks `response.ok`. For a 404 it reads the body of the error, spreads it over `EMPTY_RECIPE` and returns it as a recipe, so the query succeeds and the page shows an empty recipe.

## Step by step

1. **Reproduce it.** Open `/recipes/999`: an empty recipe. In the network tab, the request answered 404.
2. **Find who fetches a recipe.** `useRecipe` → `fetchRecipe` → `fetch`, unlike every other call of the file, which uses `request`.
3. **Use the helper that knows what an error is.**

   ```ts
   export function useRecipe(id: string | undefined) {
     return useQuery({
       queryKey: ['recipes', 'detail', id],
       queryFn: () => request<RecipeDetail>(`/api/recipes/${id}`),
       enabled: id !== undefined,
     });
   }
   ```

   Delete `fetchRecipe`, `EMPTY_RECIPE` and the import of `currentCook`. `request` throws an `ApiError` with the status, and `RecipePage` and the edit page already show "Recipe not found" for a 404 and "The recipe could not be loaded" otherwise.

The reference also adds a regression test, `client/src/pages/RecipePage.missing.test.tsx`: a missing recipe on its page and on the edit page, an answer 500, and a recipe that exists.

Then run `npm test`, open `/recipes/999` again, and move the card to **In QA**.
