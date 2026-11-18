# RB-101: A removed ingredient comes back when the recipe is saved

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Leo Tanaka (Volunteer cook) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (recipe form) |
| Labels | `form`, `ingredients`, `edit` |
| Sprint | RB Sprint 1 |
| Created | 02/03/2026 09:10 |

## Description

I edited the **Banana Pancakes** to take the butter out. I clicked **Remove** on the butter row, the row went away, I saved, and the recipe page still lists the butter.

It gets stranger when the ingredient is not the last one. I removed the egg from the same recipe and, after the save, the egg was gone but the butter was there twice.

Adding ingredients works, and changing a quantity works. Only removing is broken, and only on a recipe that already exists: in **New recipe** the rows I remove stay removed.

## Steps to reproduce

1. Open **Banana Pancakes** and click **Edit**.
2. Click **Remove** on the last ingredient (butter). The form now shows four rows.
3. Click **Save recipe**.

## Expected result

The recipe is saved with the four ingredients the form showed.

## Actual result

The recipe page shows five ingredients again, butter included.

## Acceptance criteria

- [ ] An ingredient removed in the edit form is not in the recipe after the save, whether it was the last row or one in the middle.
- [ ] The other ingredients keep their name, quantity and unit, in the order of the form.
- [ ] Removing some rows and adding others in the same edit saves exactly the rows of the form.
- [ ] A save without changes keeps every ingredient.

## Environment

- RecipeBox 1.0
- Chrome on a laptop

## Activity

**Leo Tanaka** · 02/03/2026 09:31
> I looked at the request in the browser: the butter is already in what the page sends. So the server is doing what it is told.
