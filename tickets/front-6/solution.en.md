# Solution: The steps take the width there is

**Root cause.** In `client/src/components/StepList.tsx` the paragraph of a step has `w-[38rem] shrink-0`, a fixed 608px that cannot shrink, and the list has `overflow-x-hidden`, which cuts off what does not fit. On a phone the text is wider than the screen and the part that sticks out is hidden.

## Step by step

1. **Reproduce it.** Open a recipe with the developer tools at 375px: each step is cut at the right edge.
2. **Inspect a step.** The `<p>` is 608px wide on a 375px screen; the `<ol>` hides the overflow.
3. **Let the text wrap in the space it gets.**

   ```tsx
   <ol className="flex flex-col gap-5" data-testid="steps">
     {steps.map((step, index) => (
       <li key={step.id} className="flex gap-4">
         <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-accent-content shadow-sm">
           {index + 1}
         </span>
         <p className="min-w-0 flex-1 pt-1 text-base leading-relaxed break-words" data-testid="step">
           {step.text}
         </p>
       </li>
     ))}
   </ol>
   ```

   The number keeps `shrink-0` (it must not be squeezed); the text gets `min-w-0 flex-1`.

The reference also adds a regression test, `client/src/components/StepList.layout.test.tsx`. The test environment has no layout engine, so it checks the rules themselves: no fixed width and no `shrink-0` on the text of a step, and nothing in the list that cuts content off.

Then run `npm test`, look at a recipe at 375px and at 320px, and move the card to **In QA**.
