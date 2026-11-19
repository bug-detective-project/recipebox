# RB-208: Finish the favorites: they work in the list and not on the recipe page

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Story |
| Status | To Do |
| Priority | Medium |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (favorites) |
| Labels | `api`, `favorites`, `unfinished` |
| Sprint | RB Sprint 2 |
| Created | 13/03/2026 10:30 |

## Description

The favorites went out half done, and it shows.

In the list, the heart of each card works: I click it, it fills, I click again, it empties. On the page of a recipe the heart is always empty, also for a recipe the list shows as a favorite. If I click it there, the recipe does become a favorite (the list shows it), but the heart of the page stays empty, so from the page there is no way to take the mark away.

And **Only favorites**, above the list, answers "The recipes could not be loaded."

Ingrid says the server side was never finished: the list part was done first and the rest was left with notes in the code. Please finish it.

## What is already there

- The `favorites` table and its model (`server/src/models.ts`): one row per favorite recipe.
- `PUT /api/favorites/:recipeId` puts the mark and `DELETE /api/favorites/:recipeId` takes it away. Both answer 204, both can be repeated without harm, and both answer 404 for a recipe that does not exist.
- `GET /api/recipes` answers `favorite: true` or `false` for each recipe.
- The page is ready: the heart of the list and of the recipe page, and the **Only favorites** checkbox, which sends `favorites=true`.

## What to build

1. `GET /api/recipes/:id` answers the real `favorite` of the recipe. Today it always answers `false`. The other answers that carry a whole recipe (the edit and the publish) must say the same.
2. `GET /api/recipes?favorites=true` answers only the favorites, by title like the rest of the list, and works together with the other filters (`q`, `category`, `ingredient`). Today it answers `501`. `favorites=false`, like no `favorites` at all, lists everything.

The notes left in the code (`TODO`) mark the two places.

## Acceptance criteria

- [ ] The recipe says whether it is a favorite, and follows the mark being put and taken away, exactly like the list does.
- [ ] `favorites=true` lists only the favorites, by title.
- [ ] `favorites=true` combines with `q`, `category` and `ingredient`: a recipe is listed only when it passes every filter given.
- [ ] `favorites=false` and no `favorites` list every recipe.
- [ ] `PUT` and `DELETE /api/favorites/:recipeId` keep working as described above.

## Environment

- RecipeBox 1.0
- Any browser; also with curl

## Activity

**Ingrid Solberg** · 13/03/2026 10:52
> Whoever picks this up: read how the list already knows which recipes are favorites before writing anything new. Most of what you need exists.
