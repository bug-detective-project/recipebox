# Code review: RB-108, one character and one lookup too many

The scaled quantities were computed correctly. The list then looked each ingredient up again, and the lookup always answered the first one. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `scaled.find((item) => (item.id = ingredient.id))` assigns instead of comparing. An assignment is an expression whose value is what was assigned; an id is a positive number, so the value is truthy and `find` returns the first item, every time.
- Nothing complained. An assignment is a valid expression, so TypeScript accepts it, and the lint rules of this project do too. The tools check that the code can run, not that it says what was meant.
- The shortcut "nothing to compute while the servings are the recipe's" skipped that code for the servings the page opens with, so the page looked right until someone pressed a button.
- There is a second effect: the assignment overwrote the id of the first scaled item on every pass.

## Why the reference fix is right

- The lookup is gone. `scaleIngredients` returns one item per ingredient, in the same order, with the scaled quantity. That list is what should be drawn: `scaled.map(...)`.
- The shortcut is gone too. For the servings of the recipe the factor is 1 and the quantities are unchanged, so one path serves every case. Code that only runs after a click is code that is only tested after a click.
- Less code, and nothing left that could pick the wrong item.

## Compare with your fix

- Did you change `=` to `===`? The list is right. You kept a search through the list for every line of the list, and the special case for the unscaled servings; both are there only to feed each other.
- Did you look the item up by index (`scaled[index]`)? Also right, and it shows that `shown` and `scaled` are the same list.
- Did you fix it in `scaleIngredients`? That function was correct: its own tests pass with the bug.
- Did you check below the servings of the recipe as well as above? The bug was in both directions.

## Watch for next time

- When every item of a list shows the same data, look for a lookup that cannot fail: a `find` whose condition is always true, a key that is always the same.
- The tools did not catch this one. A single `=` inside a condition deserves a second look in review, whatever the linter says.
- Before fixing a line, ask whether the line is needed.
