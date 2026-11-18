# Code review: RB-205, a filter that replaced the others

Every filter was computed correctly. At the last step, one of them was used instead of the rest. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `listRecipes` gathers the conditions in one `where` object. The ingredient cannot be a simple column condition, because ingredients live in another table, so the matching recipe ids are looked up first.
- The final query was `where: ids ? { id: ids } : where`. With an ingredient, the query got a new object holding only the ids; the category and the search, sitting in `where`, were never sent to the database.
- The comment next to it explains the mistake: "the ids were already picked from the recipes that match". They were picked from the recipes that have the **ingredient**. Nothing had applied the other filters to them.

## Why the reference fix is right

- `where.id = ids` adds the ids to the same object as the other conditions. Sequelize joins the keys of a `where` with AND, which is the meaning of "every filter that was given".
- The query always receives `where`. There is no second path that can forget a condition.
- An empty list of ids becomes `id IN ()`, which matches nothing: an ingredient no recipe has gives an empty answer, with or without other filters.
- The favorites filter, which also narrows `ids`, is covered by the same line.

## Compare with your fix

- Did you filter the result in JavaScript after the query (`recipes.filter(...)` by category)? It works for the category. The search, which also reads the photo caption, has to be rewritten in JavaScript too, and the two versions will drift. Let the database apply every condition.
- Did you spread the objects (`{ ...where, id: ids }`)? Correct. Check that the `Op.or` of the search survives the spread: symbol keys are copied by spread, and it is worth knowing why.
- Did you move the ingredient into a join with a `where` on the ingredient name? It can be right; a recipe with two matching ingredients ("egg" and "egg yolk") must still be listed once.
- Did you test three filters together, and the combination with **Only favorites**?

## Watch for next time

- Filters that work one at a time and fail together are a problem of combination. Read the place where they meet.
- `a ? x : y` between two versions of a filter is a place where one of them can be lost. Build one object and keep adding to it.
- Test filters in pairs. The single-filter tests all passed here.
