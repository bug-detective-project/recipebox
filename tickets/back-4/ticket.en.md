# RB-204: Recipes without a photo disappear from the search

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (search) |
| Labels | `api`, `search`, `join` |
| Sprint | RB Sprint 2 |
| Created | 11/03/2026 11:00 |

## Description

I searched for "pasta" and the cookbook said **0 recipes**. The **Garlic Butter Pasta** is our most cooked recipe; it is right there when I clear the search box.

After a while I saw the pattern: the search only ever shows recipes that have a photo. **Cheese Toastie** has none: searching "toastie" finds nothing. **Lemon Tart** has none: searching "lemon" finds the roast chicken, which has lemon in its title and a photo, and not the tart.

Most of what members add has no photo at first, so most new recipes cannot be searched for. Without a search, the list shows all of them.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl 'http://localhost:3001/api/recipes?q=pasta'
curl 'http://localhost:3001/api/recipes?q=lemon'
```

Or type `pasta` in the **Search** box of the list.

## Expected result

`q=pasta` answers **Garlic Butter Pasta**. `q=lemon` answers **Lemon Tart** and **Roast Chicken with Lemon**. A recipe is found by its title or its description whether it has a photo or not.

## Actual result

`q=pasta` answers `[]`. `q=lemon` answers only **Roast Chicken with Lemon**.

## Acceptance criteria

- [ ] A search finds recipes without a photo by title and by description.
- [ ] A search lists recipes with and without a photo together, each one once, by title.
- [ ] A recipe created without a photo is found right away.
- [ ] The search still reads what a photo shows (the caption): `q=glass jar` finds **Overnight Oats**.
- [ ] A search still respects the category filter.

## Environment

- RecipeBox 1.0
- Any browser; also with curl

## Activity

**Ingrid Solberg** · 11/03/2026 11:26
> The search also looks at the caption of the photo, I added that myself last month ("a glass jar of oats" finds the overnight oats). The photos are in a table of their own. I suspect my join.
