# RB-207: Log who changed each recipe

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Story |
| Status | To Do |
| Priority | Medium |
| Reporter | Ingrid Solberg (Site keeper) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (logging) |
| Labels | `api`, `logging`, `audit` |
| Sprint | RB Sprint 2 |
| Created | 12/03/2026 14:00 |

## Description

On Monday the **Roast Chicken with Lemon** had its steps replaced by a single line, "ask Leo". Leo says it was not him. I went to the log of the server to find out who saved that, and the log can tell me that a `PUT /api/recipes/4` happened at 21:14 and nothing else: not who, and not even clearly what.

The cookbook has no login, and we are not going to add one for five people. But each cook picks a name in the header of the page (**Cooking as**), and the page already sends that name with every request, in the `X-Cook` header. The server just never reads it.

I want one line in the log for each change to a recipe, saying what was done, to which recipe and by which cook. Nothing more: I do not want recipes copied into the log.

## What is already there

- The server logs with Fastify's logger: one JSON object per line, on the terminal where the server runs. Each request already gets two lines (`incoming request` and `request completed`) with its request id (`reqId`).
- Inside a route, `request.log` is the logger of that request: what it writes carries the same `reqId`.
- The client sends `X-Cook` with every request (`client/src/api/http.ts`).
- The routes that change a recipe are in `server/src/routes/recipes.ts`: create, edit, publish and delete.

## What to build

After each change to a recipe **that happened**, write one line with the logger of the request, at level `info`, with exactly these four fields besides what the logger adds by itself:

| Field | Value |
| --- | --- |
| `event` | `"recipe.changed"` |
| `action` | `"created"`, `"updated"`, `"published"` or `"deleted"` |
| `recipeId` | the id of the recipe, a number |
| `cook` | the name of the cook, or `"unknown"` |

The name of the cook is the `X-Cook` header without the spaces around it. It is a name when it has 1 to 40 characters and only letters from A to Z (upper or lower case), digits, spaces, dots (`.`), apostrophes (`'`) and dashes (`-`). A request without the header, or with anything else in it, is from `unknown`: whatever a client sends in a header must not be written to the log as it is.

Example (`level`, `time`, `pid`, `hostname` and `reqId` are the logger's):

```json
{"level":30,"time":1773324840123,"pid":4242,"hostname":"kitchen","reqId":"req-7","event":"recipe.changed","action":"updated","recipeId":4,"cook":"Leo","msg":"recipe updated"}
```

## Acceptance criteria

- [ ] Creating, editing, publishing and deleting a recipe each write one line with `event`, `action`, `recipeId` and `cook` as described, at level `info` (30), with the `reqId` of the request.
- [ ] The cook is the name of the `X-Cook` header when it is a name by the rule above, and `unknown` otherwise (no header, empty, longer than 40 characters, other characters).
- [ ] A change that did not happen (an answer 400, 404 or 409) writes no such line.
- [ ] Reading, rating and marking favorites write no such line.
- [ ] The line never carries what the cook typed: no title, description, ingredient or step.

## Environment

- RecipeBox 1.0
- The log is what the server prints on the terminal of `npm run dev`

## Activity

**Ingrid Solberg** · 12/03/2026 14:22
> To be clear about what this is not: it is not a history of the recipes and it does not go to the database. It is a line in the log, so that next time I can search it for `recipe.changed` and the id.
