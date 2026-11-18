# Code review: RB-106, a width that only fits some screens

The step list was written for one width and checked on one width. A phone is another. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The text of a step had a fixed width, `w-[38rem]` (608px), and `shrink-0`, which forbids a flex item from shrinking. The row was 608px plus the number, whatever the screen.
- The list had `overflow-x-hidden`. On a narrow screen the row stuck out, and the list cut it off without a scrollbar.
- On a laptop the row fits, so nothing looked wrong where the code was written.

## Why the reference fix is right

- The paragraph is `min-w-0 flex-1`: it takes the width left after the number, on any screen. `min-w-0` matters: a flex item will not get narrower than its content unless it is told it may.
- `break-words` wraps a word longer than the line (a long address pasted into a step) instead of letting it stick out.
- `overflow-x-hidden` is gone. It did not fix an overflow; it hid one. Without it, a future overflow shows up as a scrollbar that someone will notice.
- No breakpoint was needed. The layout has no screen size in it, so there is no size at which it breaks.

## Compare with your fix

- Did you add a breakpoint, such as `w-full md:w-[38rem]`? Phones are fixed. Check a tablet, or a laptop window between the two sizes: a fixed width is still waiting there. If the goal was a comfortable line length on wide screens, `max-w-prose` gives that without ever being wider than the screen.
- Did you only remove `overflow-x-hidden`? The text can be reached now, by scrolling sideways on every line. The ticket asks for no sideways scrolling.
- Did you make the text smaller on phones? It fits more words per line and still does not wrap; and small text is the opposite of what a kitchen needs.
- Did you change the page container instead of the list? The list was the one with a fixed width.

## Watch for next time

- A fixed width is a bet on the screen. Prefer "take what is there" (`flex-1`, `w-full`) with a `max-w-*` when a limit is wanted.
- `overflow: hidden` on a layout problem removes the evidence, not the problem.
- Check a new screen at 320px before calling it done. It takes ten seconds in the developer tools.
