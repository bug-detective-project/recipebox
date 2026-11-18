# RB-105: A recipe that does not exist shows up as an empty recipe

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Ingrid Solberg (Site keeper) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (recipe page) |
| Labels | `recipe-page`, `errors`, `fetch` |
| Sprint | RB Sprint 1 |
| Created | 04/03/2026 11:15 |

## Description

Last month's newsletter linked to a recipe that has since been deleted. Whoever clicks the link gets a recipe page with nothing in it: no title, "Main course · 0 min", a **Draft** tag, "1 serving", "No ingredients yet", "No steps yet". The **Edit**, **Publish** and **Delete** buttons are all there.

A member clicked **Publish** on it, got "That did not work" and wrote to me asking what she had broken. Nothing: the recipe is simply not there.

The page should say so. The app already has a "not found" page with a way back to the list; an address that makes no sense, like `/recipes/abc`, should get it too.

## Steps to reproduce

1. Open `http://localhost:5173/recipes/999`.

## Expected result

"Recipe not found" and a link back to the recipes. Nothing of a recipe page: no ingredients, no steps, no buttons.

## Actual result

An empty recipe, with every button of a real one.

## Acceptance criteria

- [ ] The address of a recipe that does not exist (`/recipes/999`, `/recipes/abc`) shows "Recipe not found" and the link back to the list.
- [ ] The edit address of a recipe that does not exist (`/recipes/999/edit`) shows the same, not an empty form.
- [ ] When the API fails for another reason (a 500), the page says the recipe could not be loaded. It does not say "not found" and does not show an empty recipe.
- [ ] A recipe that exists is shown as before.

## Environment

- RecipeBox 1.0
- Any browser

## Activity

**Ingrid Solberg** · 04/03/2026 11:40
> I checked with curl: `GET /api/recipes/999` answers 404 with `{"error":"Recipe not found"}`. So the server says it clearly. The page is not listening.
