import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepList } from './StepList.tsx';

const steps = [
  { id: 1, text: 'Rub the butter into the flour, add a little cold water and chill the dough for thirty minutes.' },
  { id: 2, text: 'Bake.' },
];

/** Every class of the list and of what is inside it. */
function classesOfTheList(): string[] {
  const list = screen.getByTestId('steps');
  return [list, ...list.querySelectorAll('*')].flatMap((element) => [...element.classList]);
}

// The test environment has no layout engine, so these check the rules of the list themselves: on
// a phone the text of a step has to wrap inside the screen, and nothing may be cut off.
describe('the list of steps', () => {
  it('gives no fixed width to the text of a step', () => {
    render(<StepList steps={steps} />);

    for (const step of screen.getAllByTestId('step')) {
      for (const name of step.classList) {
        // w-[38rem], w-96, min-w-[30rem] and the like are wider than a phone; min-w-0, w-full and max-w-* are fine.
        expect(name).not.toMatch(/^(sm:|md:|lg:)?(min-)?w-(\[[1-9]|[1-9])/);
        expect(name).not.toBe('whitespace-nowrap');
      }
    }
  });

  it('lets the text of a step shrink to the space there is', () => {
    render(<StepList steps={steps} />);

    for (const step of screen.getAllByTestId('step')) {
      expect([...step.classList]).not.toContain('shrink-0');
    }
  });

  it('cuts nothing off', () => {
    render(<StepList steps={steps} />);

    expect(classesOfTheList().filter((name) => /^overflow-(x-)?(hidden|clip)$/.test(name))).toEqual([]);
  });

  it('still numbers the steps and shows their text', () => {
    render(<StepList steps={steps} />);

    expect(screen.getAllByTestId('step').map((step) => step.textContent)).toEqual(steps.map((step) => step.text));
    expect(screen.getByTestId('steps')).toHaveTextContent('1Rub the butter');
  });
});
