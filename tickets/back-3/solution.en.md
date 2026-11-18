# Solution: The delete says what happened

**Root cause.** `deleteRecipe` in `server/src/recipes.ts` calls `Recipe.destroy` and ignores the number of rows it removed. The route answers 204 whenever the function returns, so a recipe that does not exist is "deleted" successfully.

## Step by step

1. **Reproduce it.** `curl -i -X DELETE http://localhost:3001/api/recipes/999` answers 204.
2. **Read the function.** `Recipe.destroy` resolves with a count; the code does not keep it.
3. **Use the count.**

   ```ts
   export async function deleteRecipe(id: number): Promise<void> {
     const deleted = Number.isInteger(id) ? await Recipe.destroy({ where: { id } }) : 0;
     if (deleted === 0) {
       throw new NotFoundError('Recipe not found');
     }
   }
   ```

   The error handler of `server/src/app.ts` answers a `NotFoundError` with 404 and `{ "error": "Recipe not found" }`.

The reference also adds a regression test, `server/src/delete-missing.test.ts`: an id that never existed, a second delete of the same recipe, ids that are not whole numbers, and a recipe that exists.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
