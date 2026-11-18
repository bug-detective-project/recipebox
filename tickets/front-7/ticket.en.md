# RB-107: The rating stars do not work with the keyboard

| Field | Value |
| --- | --- |
| Project | RecipeBox (RB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Bianca Moretti (Club organizer) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (rating) |
| Labels | `rating`, `keyboard`, `a11y` |
| Sprint | RB Sprint 2 |
| Created | 10/03/2026 09:45 |

## Description

One of our oldest members, Dona Irene, uses the cookbook with the keyboard only: a tremor makes the mouse hard for her. She can open recipes, mark favorites, edit, everything. What she cannot do is rate a recipe. Tab goes from the servings buttons straight to the end of the page: the five stars are never focused, so there is nothing to press.

Her screen reader does not mention them either. For it, "Did you cook it?" is a title with nothing under it.

She has cooked more of these recipes than anyone in the club. Hers are the ratings I most want.

## Steps to reproduce

1. Open a published recipe, for example **Hummus**.
2. Press **Tab** until the end of the page, watching where the focus goes.

## Expected result

The focus reaches the stars. With a star focused, **Space** gives that rating, and "Thanks for rating!" appears. A screen reader says which star it is: "1 star", "2 stars" … "5 stars".

## Actual result

The focus never reaches the stars. They only work with a mouse click.

## Acceptance criteria

- [ ] Each of the five stars is a control the keyboard reaches with Tab: buttons, or a group of radio buttons.
- [ ] Each star has an accessible name: exactly `1 star`, `2 stars`, `3 stars`, `4 stars` and `5 stars`.
- [ ] With a star focused, Space sends that rating, and the rating shown on the page is updated.
- [ ] The focused star shows a visible focus ring.
- [ ] A click with the mouse still rates, and the stars cannot be used while a rating is being sent.

## Environment

- RecipeBox 1.0
- Firefox with the NVDA screen reader; keyboard only

## Activity

**Ingrid Solberg** · 10/03/2026 10:10
> The heart of the favorites and the servings buttons get the focus without any problem. I would look at what they are made of and what the stars are made of.
