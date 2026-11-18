# Solution: The ingredient is one more condition

**Root cause.** `listRecipes` in `server/src/recipes.ts` runs its query with `where: ids ? { id: ids } : where`. When the ingredient filter is used, `ids` exists, and a new object with only the ids replaces the `where` that holds the category and the search.

## Step by step

1. **Reproduce it.** `curl 'http://localhost:3001/api/recipes?ingredient=egg&category=dessert'` lists a breakfast.
2. **Read how the conditions meet** in `listRecipes`: `where` gets the category and the search; `ids` gets the recipes with the ingredient (and the favorites).
3. **Add the ids to the same `where`.**

   ```ts
   if (ids) {
     where.id = ids;
   }

   const recipes = await Recipe.findAll({
     where,
     include: [{ model: Photo, as: 'photo', required: false }],
     order: [
       ['title', 'ASC'],
       ['id', 'ASC'],
     ],
   });
   ```

The reference also adds a regression test, `server/src/ingredient-with-filters.test.ts`: the ingredient alone, with a category, with a search, with both, and an ingredient no recipe has.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
