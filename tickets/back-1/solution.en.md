# Solution: One rule for the preparation time

**Root cause.** `PUT /api/recipes/:id` validates its body with `recipeUpdateBody` (`server/src/schemas.ts`), which replaces `prepTime` with `pattern: '^\d+ ?(min)?$'`. That pattern accepts only minutes, so Fastify refuses `1h30` before `parsePrepTime`, the function that reads every format, is called. `POST /api/recipes` uses `recipeBody`, which has no pattern.

## Step by step

1. **Reproduce it with curl.** The same body is created with 201 and refused on the edit with 400 and the pattern as message.
2. **Compare the schemas of the two routes** in `server/src/routes/recipes.ts`: `recipeBody` and `recipeUpdateBody`.
3. **Use the same schema for both.**

   ```ts
   app.put<{ Params: Id; Body: RecipeInput }>('/api/recipes/:id', { schema: { body: recipeBody } }, async (request) => {
     const recipe = await updateRecipe(sequelize, Number(request.params.id), request.body);
     logChange(request, 'updated', recipe.id);
     return recipe;
   });
   ```

4. **Delete `recipeUpdateBody` and `MINUTES_PATTERN`** from `server/src/schemas.ts`, and the import in the routes.

The reference also adds a regression test, `server/src/prep-time-on-edit.test.ts`: every accepted format gives the same minutes in a creation and in an edit, every refused text gets the same answer in both, and a recipe of ninety minutes is saved again.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
