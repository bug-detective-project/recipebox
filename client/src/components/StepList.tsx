import type { Step } from '../api/types.ts';

/** The steps of a recipe, numbered. The text wraps inside the width it gets, on any screen. */
export function StepList({ steps }: { steps: Step[] }) {
  if (steps.length === 0) {
    return <p className="text-muted">No steps yet.</p>;
  }
  return (
    <ol className="flex flex-col gap-4" data-testid="steps">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-content">
            {index + 1}
          </span>
          <p className="min-w-0 flex-1 text-base leading-relaxed break-words" data-testid="step">
            {step.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
