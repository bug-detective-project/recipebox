# Code review: RB-207, a log line someone can use

This ticket was not a bug. The server had a log and the log could not answer the one question asked of it. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Writing a log line that answers a question: what was done, to which recipe, by whom. A line that only says "PUT /api/recipes/4" answers none of the three.
- Using the logger that is already there, in the shape it already has (one JSON object per line), so the new lines can be searched and filtered like the others.
- Deciding what must **not** be in a log: what users typed, and anything a client can send unchecked.

## Why the reference is built this way

- `cookOf(request)` lives in its own file, `server/src/cook.ts`. Who the caller is will be needed elsewhere, and the rule for a valid name is written once.
- The header is checked against an anchored pattern before it reaches the log. A header is text chosen by the client: without the check, anyone could write arbitrary text, line breaks included, into the log of the server.
- `logChange` uses `request.log`, not a global logger. The line carries the `reqId`, so it can be tied to the request's own lines (address, status, duration) without repeating them.
- The fields are structured (`event`, `action`, `recipeId`, `cook`), not a sentence. `recipe.changed` plus an id is something a search can find; "Leo updated the roast chicken" is not.
- The call comes after the change succeeded. The log says what happened, not what was attempted.
- Only the id of the recipe is logged. The recipe itself is in the database; copying it to the log would put the members' text in a file nobody reviews.

## Compare with what you built

- Did you log before calling `updateRecipe`, or in a `preHandler` hook for every `PUT`? Then failed changes are logged as changes. Check a `PUT` to a recipe that does not exist.
- Did you write the header to the log as it came? Send `X-Cook: <script>` or a name of 500 characters and read your log.
- Did you use `console.log`, or build the JSON by hand? The line is then missing the `reqId` and the level, and it may not be valid JSON when a value has a quote in it.
- Did you put the cook in the message (`"Leo updated recipe 4"`) instead of in a field? A person can read it; a filter cannot.
- Did you log `request.body`, or the recipe that was saved? Titles and steps are now in the log.
- Did you also log ratings and favorites? The ticket asks for changes to the recipe itself; more lines make the ones that matter harder to find.

## Watch for next time

- Before writing a log line, name the question it will answer and the person who will ask it.
- A log is an output of your program. Treat what goes into it like what goes into a page: check what comes from outside, and leave out what the reader should not see.
- Structured fields first, sentence last. The sentence is for humans skimming; the fields are for finding.
