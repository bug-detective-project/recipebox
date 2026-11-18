# Code review: RB-208, finishing what someone else started

This ticket was unfinished work, not a bug. Most of the feature existed; the job was to find the two missing pieces and build them the way the rest was built. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Reading a half-built feature before adding to it: what exists, how it is shaped, and where the author stopped. The `TODO` notes mark the stops; the code around them shows the shape.
- Keeping an API consistent: the same recipe must say the same thing in the list and on its own page, and a filter must combine with the others like the others do.
- `501 Not Implemented` is an honest answer for something not built yet. It is also a promise somebody has to keep.

## Why the reference is built this way

- The recipe gets its mark from `favoriteIds()`, the same helper the list uses. One source of truth: the two answers cannot disagree.
- The change is in `getRecipe`, so every answer that carries a whole recipe (read, edit, publish) is right at once.
- The filter reuses `ids`, the mechanism the ingredient filter already had: a list of allowed ids that goes into the single `where` of the query. Combining favorites with category, search and ingredient needed no code of its own.
- `favorites=false` and an absent `favorites` take the same path, the one that does not filter. The schema of the query string already turns the text `true`/`false` into a boolean.
- The 501 and the two `TODO` notes are gone. Nothing in the code says "unfinished" any more.

## Compare with what you built

- Did you query the `favorites` table again inside `getRecipe` with new code? It works. There are now two pieces of code that decide what a favorite is.
- Did you filter the list in JavaScript after the query (`recipes.filter((recipe) => favorites.has(recipe.id))`)? The result is right for this list. If the list ever gets pages, filtering after the query breaks them; conditions belong in the query.
- Did you add `favorite` as a column of `recipes`? The table of favorites and its two routes already exist and work. A second place to store the mark means two places to keep in step.
- Did you leave the 501 for `favorites=false`? Check that request.
- Did you test the filter combined with the ingredient filter? Both narrow the same list of ids, which is the easiest place to lose one of them.
- Did you remove the `TODO` notes?

## Watch for next time

- In unfinished code, the first hour is for reading. Look for the pattern the author was following and continue it, unless you can say why it is wrong.
- When the same fact is shown in two places (a list and a detail), make both read it from the same function.
- A `TODO` is a debt with no date. When you finish the work, delete the note.
