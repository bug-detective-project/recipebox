import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5];

const nameOf = (stars: number) => (stars === 1 ? '1 star' : `${stars} stars`);

/** The five stars a cook rates a recipe with: a click on a star gives that many stars. */
export function RatingStars({ disabled, onRate }: { disabled?: boolean; onRate: (stars: number) => void }) {
  // The stars up to the one under the pointer are shown filled.
  const [preview, setPreview] = useState(0);

  return (
    <div aria-label="Rate this recipe" className={`flex gap-1.5 ${disabled ? 'opacity-50' : ''}`} onMouseLeave={() => setPreview(0)}>
      {STARS.map((stars) => (
        <span
          key={stars}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised text-2xl leading-none text-accent shadow-sm transition-transform hover:scale-110"
          title={nameOf(stars)}
          onMouseEnter={() => setPreview(stars)}
          onClick={() => !disabled && onRate(stars)}
        >
          {stars <= preview ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
