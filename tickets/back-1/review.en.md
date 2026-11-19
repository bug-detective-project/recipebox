# Code review: RB-201, one rule in two places

The cookbook knew how to read "1h30". The edit asked a second, older rule first, and that rule had never heard of hours. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- What a preparation time means is decided by `parsePrepTime` in `server/src/duration.ts`. Creating and editing both end up there.
- The edit route had its own schema, `recipeUpdateBody`, with a `pattern` for `prepTime` from the time when a time was only minutes. Fastify checks the schema before the route runs, so the edit refused `1h30` before `parsePrepTime` was ever asked.
- The page made it worse: the form sends any time of an hour or more as `1h30`, so the form itself produced a value the edit refused.

## Why the reference fix is right

- `PUT` uses `recipeBody`, the same schema as `POST`. The schema says only that `prepTime` is a short text; its meaning stays with `parsePrepTime`.
- `recipeUpdateBody` and `MINUTES_PATTERN` are deleted. There is nothing left to keep in step.
- Both routes now give the same answer for a text that is not a time, with a message a cook can act on, because both get it from the same function.

## Compare with your fix

- Did you widen the pattern of the edit until it accepted hours? It passes today. You now have a regular expression in `schemas.ts` and another in `duration.ts` describing one format, and the next change to one of them brings this ticket back. Check also `1h90`, and the message a cook sees for a refused time.
- Did you move the pattern to `recipeBody` so both routes share it? One rule is better than two, but the schema can only say "matches or not": the 400 would carry the regular expression instead of "Write the time like 45 min or 1h30".
- Did you change the form to send `90 min`? The API would still disagree with itself for any other client, and the ticket is about the API.
- Did you change `parsePrepTime`? It was right.

## Watch for next time

- When create and edit behave differently for the same field, put their validation side by side. The difference is the bug.
- A format should be described once. If a schema and a parser both describe it, one of them will be out of date.
- An error message that is a regular expression is a sign that a rule is answering in place of the code that knows what to say.
