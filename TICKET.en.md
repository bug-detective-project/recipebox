# RB-205: The ingredient search ignores the category filter

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (search) |
| Labels | `api`, `filters`, `ingredient` |
| Sprint | RB Sprint 2 |
| Created | 11/03/2026 15:45 |

## Description

We had a tray of eggs to use up and I wanted a dessert. I chose **Dessert** in the category, typed `egg` in **Ingredient**, and the list gave me **Banana Pancakes**, which is a breakfast, next to the three desserts.

It is not only the category. With `chicken` in **Search** and `garlic` in **Ingredient** I get every recipe with garlic, hummus included.

Each filter works by itself. The category alone is right, the search alone is right, the ingredient alone is right. As soon as the ingredient is filled, the other filters stop counting.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl 'http://localhost:3001/api/recipes?ingredient=egg&category=dessert'
curl 'http://localhost:3001/api/recipes?ingredient=garlic&q=chicken'
```

Or on the list: choose the category **Dessert** and type `egg` in **Ingredient**.

## Expected result

The first request answers the three desserts with egg: **Chocolate Mug Cake**, **Egg Custard** and **Lemon Tart**. The second answers **Roast Chicken with Lemon** only. A recipe is listed when it passes every filter that was given.

## Actual result

The first request also answers **Banana Pancakes**. The second answers every recipe with garlic.

## Acceptance criteria

- [ ] The ingredient filter works together with the category, with the search and with **Only favorites**, in any combination: a recipe is listed only when it passes all of them.
- [ ] An ingredient no recipe has gives an empty list, whatever the other filters.
- [ ] Each filter alone works as today.

## Environment

- RecipeBox 1.0
- Any browser; also with curl

## Activity

**Bianca Moretti** · 11/03/2026 16:03
> Funny detail: with the ingredient filled, I can pick any category I like and the list does not move at all.
