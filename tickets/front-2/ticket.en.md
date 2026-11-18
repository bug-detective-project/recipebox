# RB-102: The form accepts a recipe without ingredients

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (recipe form) |
| Labels | `form`, `validation`, `react-hook-form` |
| Sprint | RB Sprint 1 |
| Created | 02/03/2026 14:25 |

## Description

We have three recipes in the cookbook with no ingredients at all. The members who wrote them say they removed the empty row the form starts with, meant to fill the list later, clicked **Save recipe**, and the form just saved.

The form is supposed to stop that. Somebody even wrote the message for it, "Add at least one ingredient", and I have never seen it on the screen.

A recipe like that cannot be published either, so the member ends up with a draft and a **Publish** button that answers "That did not work".

## Steps to reproduce

1. Click **New recipe** and fill the title, the preparation time and one step.
2. Click **Remove** on the only ingredient row.
3. Click **Save recipe**.

## Expected result

The form stays open and shows "Add at least one ingredient". Nothing is sent to the server.

## Actual result

The recipe is created without ingredients and its page opens.

## Acceptance criteria

- [ ] A new recipe with no ingredient is not sent: the form stays open and shows a message that says at least one ingredient is needed.
- [ ] The same when every ingredient of a saved recipe is removed in the edit form; the saved recipe keeps its ingredients.
- [ ] After an ingredient is added, the message goes away and the recipe is saved.
- [ ] A recipe with one ingredient or more is saved as before.

## Environment

- RecipeBox 1.0
- Any browser

## Activity

**Ingrid Solberg** · 02/03/2026 15:02
> The rule is in the form, I can see it in the code. It simply never fires for an empty list. The form is built with React Hook Form: maybe the rule does not mean what we think it means.
