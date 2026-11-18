# Code review: RB-107, a click handler is not a control

The stars looked like buttons and behaved like buttons for a mouse. For the keyboard and for a screen reader they were five pieces of text. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- Each star was a `<span onClick={…}>`. The browser gives a span no behavior: no place in the Tab order, no reaction to Space or Enter, no role.
- The name of the star was only in `title`, which is a tooltip for a pointer.
- "Disabled" was a check inside the click handler and a lighter color. Nothing told assistive technology that the control was unavailable.

## Why the reference fix is right

- Each star is a `<button type="button">`. Focus, Space, Enter, the role and the disabled state all come from the element. There is no key handling to write, and so none to get wrong.
- `aria-label` gives each one its name ("4 stars"), and the glyph is `aria-hidden` so the name is not read together with "black star".
- The buttons sit in a `role="group"` named "Rate this recipe", so the question the stars answer is announced with them.
- `disabled` is the attribute: while a rating is being sent, the buttons cannot be focused or pressed.
- The filled preview follows the focus as well as the pointer, so a keyboard user sees how many stars they are about to give. The focus ring is the one every control of the app has.

## Compare with your fix

- Did you keep the spans and add `tabIndex={0}`, `role="button"` and an `onKeyDown`? It can pass, and you rebuilt by hand what `<button>` gives for free. Check the details that usually go missing: Space **and** Enter, no page scroll on Space, and the disabled state (`aria-disabled`, and no focus).
- Did you use radio buttons with labels? That is a good model for "pick one of five", with arrow keys for free. Check that choosing with the arrows does not send a rating for every star you pass over.
- Did you name the stars "★★★★" or leave the glyph as the name? A screen reader reads glyphs badly or not at all. The names in the ticket are the ones to use.
- Did you remove the focus outline because it "looked odd" on a star? Then the keyboard user is back to guessing.

## Watch for next time

- If it reacts to a click, it is a control: start from `<button>`, `<a>` or an `<input>`, and style it afterwards.
- Try every new screen once with the keyboard only. Tab, Space, Enter: it takes a minute and finds this whole class of bug.
