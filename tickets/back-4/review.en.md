# Code review: RB-204, the join that filtered

The search conditions were right. The way the photos table was joined to answer them removed half the cookbook first. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The search reads a column of another table, the caption of the photo, so the query has to join `photos`.
- The include was `required: Boolean(filters.q)`. With a search, Sequelize wrote an INNER JOIN: only recipes with a matching row in `photos` survive the join.
- The reasoning in the comment, "a search needs the photo", confuses two things: the query needs the photos **table** to compare captions; a recipe does not need a photo to be found by its title.
- Without a search the join was a LEFT JOIN, so the plain list never showed the problem.

## Why the reference fix is right

- `required: false`, always: a LEFT JOIN keeps every recipe and gives NULL for the photo columns when there is no photo.
- The OR does the rest. `NULL ILIKE '%pasta%'` is not true, so a recipe without a photo is found only through its title or description, which is exactly what is wanted.
- A recipe has at most one photo, so the join does not multiply rows: each recipe is still listed once.
- One line changed, in the place that decided which rows exist. The conditions and the order were not touched.

## Compare with your fix

- Did you remove `$photo.caption$` from the search? Recipes without a photo are back, and the search by caption, which members use, is gone. The ticket asks to keep it.
- Did you run two queries (one by text, one by caption) and merge the results? It can be made right; check duplicates and the order by title. The database does this in one statement.
- Did you add a second include, or `subQuery: false`, until it worked? Look at the SQL (`logging: console.log` in `openDatabase` shows it): if it still says INNER JOIN, some recipes are still missing.
- Did you check a search combined with a category? The join must not undo the other filters.

## Watch for next time

- A join can remove rows. When results go missing, ask of every join whether it is INNER or LEFT before reading the WHERE.
- With an ORM, read the SQL it writes at least once per query. `required`, or a `where` inside an `include`, changes the kind of join without the word "join" appearing in your code.
- Test a search with data that lacks the optional part: the recipe without a photo, the user without an address.
