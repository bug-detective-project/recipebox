# Solution: The servings are a number where they are stored

**Root cause.** The `servings` column is declared `DataTypes.STRING(10)` in `server/src/models.ts`, and `recipeBody` in `server/src/schemas.ts` accepts `servings` as `type: 'string'`. The API stores and answers the servings as text; on the page `"4" + 1` is `"41"`.

## Step by step

1. **Look at the answer.** `curl http://localhost:3001/api/recipes/1` shows `"servings":"4"`.
2. **Follow the value back.** `summaryOf` copies `recipe.servings` from the model; the model declares a text column.
3. **Store a number.** In `server/src/models.ts`:

   ```ts
   servings: { type: DataTypes.INTEGER, allowNull: false },
   ```

4. **Accept only a number.** In `server/src/schemas.ts`:

   ```ts
   servings: { type: 'integer', minimum: 1, maximum: 100 },
   ```

5. **Create the table again.** `npm run db:reset` builds the tables from the models; without it your database keeps the text column.

The reference also adds a regression test, `server/src/servings-number.test.ts`: the servings are a number in the list and in the recipe, after a creation and after an edit, and values that are not a whole number from 1 to 100 are refused.

Then run `npm test`, press **+** on a recipe, and move the card to **In QA**.
