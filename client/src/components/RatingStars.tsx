import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5];

const nameOf = (stars: number) => (stars === 1 ? '1 star' : `${stars} stars`);

/**
 * The five stars a cook rates a recipe with. Each star is a button, so it is reached with Tab and
 * pressed with Enter or Space like any other, and a screen reader says how many stars it gives.
 */
export function RatingStars({ disabled, onRate }: { disabled?: boolean; onRate: (stars: number) => void }) {
  // The stars up to the one under the pointer or with the focus are shown filled.
  const [preview, setPreview] = useState(0);

  return (
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
  );
}
