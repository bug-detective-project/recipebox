# RB-206: A published recipe goes back to draft and loses its ratings

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Leo Tanaka (Volunteer cook) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (recipes) |
| Labels | `api`, `status`, `ratings` |
| Sprint | RB Sprint 2 |
| Created | 12/03/2026 09:15 |

## Description

I fixed one typo in the description of the **Banana Pancakes** and saved. The recipe came back with a **Draft** tag and "No ratings yet". It had 4.7 from three ratings, and the stars to rate it are gone from its page.

I published it again. It is published, and the three ratings did not come back. They are gone for good.

So every edit of a published recipe throws away what the club thought of it. People have stopped fixing recipes because of that, which is the opposite of what we want.

The rule of the cookbook, as Bianca wrote it when we started:

- A new recipe is a draft. Publishing is a step of its own, and editing never changes whether a recipe is published.
- Ratings belong to the recipe. They only go away when the recipe is deleted.

## Steps to reproduce

In the VS Code terminal, with the app running (recipe 1 is published and has three ratings):

```sh
curl http://localhost:3001/api/recipes/1
curl -X PUT http://localhost:3001/api/recipes/1 -H 'Content-Type: application/json' \
  -d '{"title":"Banana Pancakes","category":"breakfast","servings":4,"prepTime":"25 min","ingredients":[{"name":"egg","quantity":2}],"steps":["Cook."]}'
```

Or on the screen: open **Banana Pancakes**, click **Edit**, then **Save recipe**.

## Expected result

The answer of the `PUT` has `"status": "published"` and `"rating": { "average": 4.7, "count": 3 }`, as before the edit.

## Actual result

`"status": "draft"` and `"rating": { "average": null, "count": 0 }`.

## Acceptance criteria

- [ ] Editing a published recipe keeps it published.
- [ ] Editing a recipe keeps its ratings, and it can still be rated afterwards.
- [ ] Editing a draft keeps it a draft.
- [ ] A new recipe is still created as a draft, and publishing is still done by `POST /api/recipes/:id/publish`.

## Environment

- RecipeBox 1.0
- Any browser; also with curl

## Activity

**Bianca Moretti** · 12/03/2026 09:40
> The form does not even have a field for the status, so it is not something the page sends. The server decides it by itself.
