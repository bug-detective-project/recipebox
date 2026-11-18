# RB-108: The ingredient list repeats the first item

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Leo Tanaka (Volunteer cook) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (recipe page) |
| Labels | `recipe-page`, `ingredients`, `servings` |
| Sprint | RB Sprint 2 |
| Created | 10/03/2026 19:20 |

## Description

We were eleven on Thursday instead of eight, so I opened the **Lemon Tart** and pressed **+** on the servings. The whole list of ingredients turned into the same line, five times:

- 281.25 g flour
- 281.25 g flour
- 281.25 g flour
- 281.25 g flour
- 281.25 g flour

No butter, no eggs, no sugar, no lemons. Pressing **−** to go back to 8 servings brings the right list back. Going below 8 breaks it the same way.

So the recipe is right as long as nobody changes the servings, which is the whole point of having the buttons.

## Steps to reproduce

1. Open **Banana Pancakes** (4 servings, 5 ingredients).
2. Click **+** next to the servings.

## Expected result

Five lines, one per ingredient, each with its own quantity for 5 servings: 2.5 ripe banana, 2.5 egg, 250 g flour, 312.5 ml milk, 1.25 tbsp butter.

## Actual result

Five lines, all of them "2.5 ripe banana".

## Acceptance criteria

- [ ] For any number of servings, the list has one line per ingredient, in the order of the recipe, each with its own name, unit and scaled quantity.
- [ ] Going up and then back to the servings of the recipe shows the original list.
- [ ] The same for a recipe that was just created.

## Environment

- RecipeBox 1.0
- Any browser

## Activity

**Leo Tanaka** · 10/03/2026 19:41
> The first line is always right, also after scaling: 281.25 g of flour is correct for 9 servings. It is the other lines that copy it.
