# RB-106: The steps of a recipe cannot be read on a phone

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
| Labels | `recipe-page`, `steps`, `mobile` |
| Sprint | RB Sprint 2 |
| Created | 09/03/2026 18:30 |

## Description

Nobody cooks with a laptop on the counter. We prop a phone against the flour jar, and on a phone the steps of every recipe are cut off on the right: each line just stops at the edge of the screen, in the middle of a sentence. The page does not scroll sideways, so the rest of the line cannot be reached at all.

Last Thursday the **Lemon Tart** told half the kitchen to "Line a tart tin with the dough and bake it blind at" and nothing else. We guessed 180. We were right, but still.

The ingredients are fine, the title is fine. Only the steps. On a laptop everything looks normal.

## Steps to reproduce

1. Open **Lemon Tart**.
2. Make the browser window as narrow as a phone (or use the device toolbar of the developer tools at 375px).
3. Read the steps.

## Expected result

The text of each step wraps into as many lines as it needs, inside the screen, with its number on the left.

## Actual result

Each step is one very wide column of text, cut off at the right edge of the screen.

## Acceptance criteria

- [ ] On screens 375px and 320px wide, every step is whole inside the screen: nothing cut off, and no scrolling sideways, of the page or of the list.
- [ ] A long step wraps into more lines.
- [ ] The number of each step stays on the left of its text, and the text keeps a size that can be read (14px or more).
- [ ] On a wide screen the steps look as they do today.

## Environment

- RecipeBox 1.0
- Phones (seen on Android and iPhone); fine on a laptop

## Activity

**Leo Tanaka** · 09/03/2026 18:52
> Shrinking the laptop window shows the same thing, so it is not about the phone itself. It is about the width.
