# Solution: An edit changes what the cook typed, and nothing else

**Root cause.** In `server/src/recipes.ts`, `fieldsOf` returns `status: 'draft'` among the columns of a recipe, and `updateRecipe` writes those columns, so every edit turns the recipe into a draft. `updateRecipe` then runs `Rating.destroy` for the recipe, which deletes its ratings.

## Step by step

1. **Reproduce it.** The `PUT` of the ticket answers `"status": "draft"` and a rating with `count: 0`.
2. **List what the edit writes.** `recipe.update(fields)` with the fields of `fieldsOf`, the parts, and a `Rating.destroy`.
3. **Take the status out of `fieldsOf`.**

   ```ts
   return {
     title: input.title.trim(),
     description: (input.description ?? '').trim(),
     category: input.category,
     servings: input.servings,
     prepMinutes,
   };
   ```

   A new recipe is still a draft: the model has `defaultValue: 'draft'`.

4. **Remove the deletion of the ratings** from `updateRecipe`.

   ```ts
   await sequelize.transaction(async (transaction) => {
     await recipe.update(fields, { transaction });
     await writeParts(recipe.id, input, transaction);
   });
   ```

The reference also adds a regression test, `server/src/edit-published.test.ts`: an edited published recipe keeps its status and its ratings and can be rated again, a draft stays a draft, and a new recipe is a draft.

Then run `npm run db:reset` (to get the sample ratings back), `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
