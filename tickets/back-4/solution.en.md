# Solution: A join that keeps every recipe

**Root cause.** `listRecipes` in `server/src/recipes.ts` joins the photos with `include: [{ model: Photo, as: 'photo', required: Boolean(filters.q) }]`. With a search `required` is true, Sequelize writes an INNER JOIN, and every recipe without a row in `photos` is left out before the search conditions are applied.

## Step by step

1. **Reproduce it.** `curl 'http://localhost:3001/api/recipes?q=pasta'` answers `[]`.
2. **See the pattern.** Only recipes with a photo are ever found.
3. **Read the include** of the query in `listRecipes`: `required` depends on `filters.q`.
4. **Make the join a LEFT JOIN, always.**

   ```ts
   const recipes = await Recipe.findAll({
     where,
     // A recipe without a photo is still a recipe: the join must not leave it out.
     include: [{ model: Photo, as: 'photo', required: false }],
     order: [
       ['title', 'ASC'],
       ['id', 'ASC'],
     ],
   });
   ```

   The condition on `$photo.caption$` stays in the `Op.or`: for a recipe without a photo it is simply not true.

The reference also adds a regression test, `server/src/search-without-photo.test.ts`: recipes without a photo found by title and by description, mixed results, a recipe just created, the caption still searched, and the category kept.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
