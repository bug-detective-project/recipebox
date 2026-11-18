# Code review: RB-103, the address is the state

The list filtered correctly. What was wrong was where the filters lived: in the memory of one component, which is thrown away whenever the cook leaves the page. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `useFilters` kept the four filters in `useState`. That state belongs to `RecipesPage` while it is on screen.
- Opening a recipe unmounts the list. Coming back mounts a new one, with new, empty state. A reload does the same.
- The address never changed, so there was nothing to copy, bookmark or send.

## Why the reference fix is right

- The filters are read from the query string with `useSearchParams` and written back to it. The address is the one place where they live, so Back, Forward, reload and a pasted link all show the same list without any extra code.
- `change` writes with `{ replace: true }`: typing "lemon" is one visit to the list, not five entries in the history.
- Empty values are left out, so the address of the unfiltered list is still `/`.
- What comes from the address is checked: a category that does not exist is treated as no category instead of being sent to the API.
- `RecipesPage` did not change. It asked a hook for `filters` and `change` before, and still does.

## Compare with your fix

- Did you keep `useState` and copy it to the address in an effect? There are now two sources and a moment when they disagree, and an address opened directly has to be read back into the state by hand.
- Did you save the filters in `localStorage`? Back and reload work, but a link still does not, and the filters follow the cook to visits where they are not wanted.
- Did you push a new history entry for every keystroke? Back then walks through "lemo", "lem", "le" before leaving the list.
- Did you only handle `q`? The ticket asks for the four filters.

## Watch for next time

- If a reload, the Back button or a shared link should show the same thing, that thing belongs in the address.
- State in a component is for what may be forgotten when the component goes away: an open menu, a hover, a draft not yet submitted.
