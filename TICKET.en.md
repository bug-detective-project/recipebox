# RB-202: Servings saved as text break the yield calculation

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
| Labels | `api`, `servings`, `types` |
| Sprint | RB Sprint 1 |
| Created | 05/03/2026 18:10 |

## Description

Open any recipe and press **+** on the servings. **Banana Pancakes** is for 4; one press and the page says **41 servings** and asks for 2050 g of flour. One more press: **411 servings**.

**−** behaves: from 4 it goes to 3, and the quantities are right. From 3, **+** goes back to 4 as it should. It is only the first **+** on a recipe that goes mad.

Ingrid looked at what the server sends and says the servings arrive in quotes. She also managed to save a recipe with the servings `many`, which the form does not even allow: she did it with curl. That recipe shows "many servings" and every quantity as `NaN`.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl http://localhost:3001/api/recipes/1
curl -i -X POST http://localhost:3001/api/recipes -H 'Content-Type: application/json' \
  -d '{"title":"Mystery Stew","category":"main","servings":"many","prepTime":"30 min","ingredients":[],"steps":[]}'
```

On the screen: open **Banana Pancakes** and click **+** next to the servings.

## Expected result

- `GET /api/recipes/1` answers `"servings": 4`, a number, and so does the list.
- The `POST` answers `400` with `servings` among the `fields`: the servings are a whole number from 1 to 100.
- On the page, **+** goes from 4 to 5 servings and the flour from 200 g to 250 g.

## Actual result

- `"servings": "4"`, a text.
- The `POST` answers 201.
- The page goes from 4 to 41 servings.

## Acceptance criteria

- [ ] The list and the recipe answer the servings as a JSON number.
- [ ] Creating and editing save the servings as a number, and answer it as a number.
- [ ] Servings that are not a whole number from 1 to 100 (`0`, `-2`, `101`, `2.5`, `"many"`, `"4-6"`) are refused with 400 and `servings` in `fields`.
- [ ] On the recipe page, each press of **+** adds exactly one serving.

## Environment

- RecipeBox 1.0
- Any browser; also with curl

## Activity

**Ingrid Solberg** · 05/03/2026 18:34
> 4 + 1 = 41 is what you get when the 4 is a text: "4" + 1. The page only adds one to what it receives. I would follow the 4 backwards, from the page to where it is stored.
