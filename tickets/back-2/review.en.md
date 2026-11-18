# Code review: RB-202, a number that was a text

The symptom was on the page and the cause two layers below it, in how the server stores and checks one field. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The `servings` column was declared `DataTypes.STRING(10)`, and the body schema accepted `type: 'string'`. The database kept text and the API answered text: `"servings": "4"`.
- The TypeScript types said `number` everywhere. They describe what the code expects, and nothing checks them against what the database returns at run time.
- The page did arithmetic on what it received. `"4" - 1` is 3, because `-` converts; `"4" + 1` is `"41"`, because `+` joins texts. That is why only **+** from the recipe's own servings looked broken.
- With a text column and a text schema, nothing refused `"many"` either.

## Why the reference fix is right

- The column is `DataTypes.INTEGER`, so the value is a number where it is stored and a number when it is read.
- The schema is `{ type: 'integer', minimum: 1, maximum: 100 }`: the request is refused at the door, with the field named, before anything is saved.
- The fix is at the source. Every reader of the API gets a number: this page, the list, and any client written later.
- The page is untouched. It was right to assume what the API promised.

## Compare with your fix

- Did you write `Number(recipe.servings)` on the page? This screen is fixed. The API still answers text, still stores `"many"`, and the next screen that reads `servings` has the same bug.
- Did you convert in `summaryOf` with `Number(...)` and leave the column as text? The answer is a number now, but `"many"` becomes `NaN`, which JSON writes as `null`, unless the schema refuses it first. Check what a recipe saved before your fix answers.
- Did you fix the schema and not the model, or the model and not the schema? Each one alone leaves a door open: text in the database, or anything accepted.
- Did you forget `npm run db:reset`? The model changed and the table did not. Your tests pass, because they create their own tables, while the app still reads a text column.

## Watch for next time

- When a value is wrong on the screen, follow it backwards to where it is stored before changing the place where it shows.
- A TypeScript type on data that comes from outside (a database, a request) is a hope until something checks it at run time. Here that something is the column type and the schema.
- `+` with a text on either side joins. Of the arithmetic operators, it is the one that hides this mistake.
