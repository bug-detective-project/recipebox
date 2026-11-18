# RB-103: The search is gone after opening a recipe and going back

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (recipe list) |
| Labels | `list`, `search`, `url` |
| Sprint | RB Sprint 1 |
| Created | 03/03/2026 10:05 |

## Description

On club nights I search the cookbook for what we are cooking, say "lemon", and open the recipes one by one. Every time I press the browser's **Back** button, the list is whole again: the search box is empty and I have to type "lemon" once more.

The same happens with the category, the ingredient and **Only favorites**: a reload of the page forgets all of them.

And I cannot send anyone a link to a search. Whatever I filter, the address stays `http://localhost:5173/`. I wanted to send the club "every dessert with egg" and had to send a screenshot.

## Steps to reproduce

1. Open the list and type `tart` in **Search**. One recipe is left, **Lemon Tart**.
2. Look at the address bar: nothing changed.
3. Open **Lemon Tart**, then press the browser's **Back** button.

## Expected result

The list comes back with `tart` in the search box and only **Lemon Tart** in it. The address shows the filters (for example `/?q=tart`), and opening that address anywhere gives the same list.

## Actual result

The list comes back whole, with an empty search box. The address never shows the filters.

## Acceptance criteria

- [ ] The search is written in the address as `?q=…` while the cook types, and a cleared filter leaves the address.
- [ ] Going to a recipe and back, and reloading the page, keep the filters and the list.
- [ ] Opening an address with filters (`/?q=lemon&category=dessert`) shows that list, with the fields already filled.
- [ ] The category (`category`), the ingredient (`ingredient`) and **Only favorites** (`favorites=true`) are in the address too.

## Environment

- RecipeBox 1.0
- Chrome and Safari

## Activity

**Bianca Moretti** · 03/03/2026 10:20
> The list itself filters fine while I stay on it. It is only that the page does not remember anything.
