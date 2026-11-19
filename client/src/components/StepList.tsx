import type { Step } from '../api/types.ts';

/** The steps of a recipe, numbered, in a column of text that is comfortable to read. */
export function StepList({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return <p className="text-muted">No steps yet.</p>;
  }
  return (
    <ol className="flex flex-col gap-5 overflow-x-hidden" data-testid="steps">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-accent-content shadow-sm">
            {index + 1}
          </span>
          <p className="w-[38rem] shrink-0 pt-1 text-base leading-relaxed" data-testid="step">
            {step.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
