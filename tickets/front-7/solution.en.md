# Solution: The stars are buttons

**Root cause.** `client/src/components/RatingStars.tsx` draws each star as a `<span>` with an `onClick`. A span is not focusable, does not react to the keyboard and has no role, so the stars exist only for a mouse.

## Step by step

1. **Reproduce it.** On a published recipe, press Tab to the end of the page: the stars are skipped.
2. **Inspect a star.** It is a `<span title="4 stars">`; the heart next to the title is a `<button>`.
3. **Use the element that is a control.**

   ```tsx
   <div role="group" aria-label="Rate this recipe" className="flex gap-1" onMouseLeave={() => setPreview(0)}>
     {STARS.map((stars) => (
       <button
         key={stars}
         type="button"
         className="rounded px-1 text-2xl text-accent disabled:opacity-50"
         title={nameOf(stars)}
         aria-label={nameOf(stars)}
         disabled={disabled}
         onMouseEnter={() => setPreview(stars)}
         onFocus={() => setPreview(stars)}
         onBlur={() => setPreview(0)}
         onClick={() => onRate(stars)}
       >
         <span aria-hidden="true">{stars <= preview ? '★' : '☆'}</span>
       </button>
     ))}
   </div>
   ```

   `nameOf` already gives "1 star", "2 stars"… The focus ring comes from `:focus-visible` in `styles.css`.

The reference also adds a regression test, `client/src/components/RatingStars.keyboard.test.tsx`: a named control per star, Tab reaching them, Space giving the rating of the focused star, the click, and the disabled state.

Then run `npm test`, rate a recipe without touching the mouse, and move the card to **In QA**.
