# RB-203: Deleting a recipe that does not exist is answered as a success

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Ingrid Solberg (Site keeper) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (recipes) |
| Labels | `api`, `delete`, `status-codes` |
| Sprint | RB Sprint 1 |
| Created | 05/03/2026 10:20 |

## Description

I keep a small script that tidies the cookbook after each club night: it deletes the test recipes by id. Last week I typed one id wrong. The script said everything went fine, and the test recipe was still in the list the next morning.

The API answered `204 No Content` for a recipe that was never there. It says the same for an id like `abc`. A success means "it is gone because of what you asked"; here nothing happened at all.

Every other request about a single recipe (reading, editing, publishing) answers 404 when the recipe does not exist. The delete should too.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl -i -X DELETE http://localhost:3001/api/recipes/999
curl -i -X DELETE http://localhost:3001/api/recipes/abc
```

## Expected result

`404` with `{ "error": "Recipe not found" }` for both, and nothing removed.

## Actual result

`204 No Content` for both.

## Acceptance criteria

- [ ] Deleting an id that never existed answers 404 with `{ "error": "Recipe not found" }`.
- [ ] Deleting the same recipe a second time answers 404.
- [ ] An id that is not a positive whole number (`abc`, `1.5`, `0`, `-3`) answers 404.
- [ ] A delete that answers 404 removes nothing.
- [ ] Deleting a recipe that exists still answers 204 with an empty body, and the recipe is gone.

## Environment

- RecipeBox 1.0
- curl and a shell script

## Activity

**Ingrid Solberg** · 05/03/2026 10:41
> The database knows the answer: a delete says how many rows it removed. Somebody is not asking.
