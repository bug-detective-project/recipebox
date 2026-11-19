# RB-104: An edited recipe is still the old one in the list

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Leo Tanaka (Volunteer cook) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (data cache) |
| Labels | `list`, `cache`, `tanstack-query` |
| Sprint | RB Sprint 1 |
| Created | 03/03/2026 16:40 |

## Description

I renamed **Cheese Toastie** to "Grilled Cheese". The recipe page shows the new name right after the save. Then I click **All recipes** and the card still says **Cheese Toastie**, with the old description.

If I reload the page, the list is right. If I wait a minute or so and come back to the list, it is right too. So the save works; the list just shows something old for a while.

Two members already edited the same recipe twice because they thought the first save had failed.

## Steps to reproduce

1. Open the list, then open **Cheese Toastie** and click **Edit**.
2. Change the title to `Grilled Cheese` and click **Save recipe**. The recipe page shows the new title.
3. Click **All recipes**.

## Expected result

The card shows **Grilled Cheese**, without a reload.

## Actual result

The card still shows **Cheese Toastie** until the page is reloaded.

## Acceptance criteria

- [ ] After a recipe is edited, the list shows its new title, time, category and description without a reload.
- [ ] A list that was filtered before the edit shows the saved recipe too.
- [ ] The page of the recipe keeps showing the saved recipe right after the save.

## Environment

- RecipeBox 1.0
- Chrome on a laptop

## Activity

**Ingrid Solberg** · 03/03/2026 17:05
> For what it is worth: a new recipe shows up in the list right away, and a deleted one leaves it right away. It is only the edit that the list does not notice.
