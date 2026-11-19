import type { RatingSummary as Rating } from '../api/types.ts';

/** "★ 4.7 (3 ratings)", or that nobody rated the recipe yet. */
export function RatingSummary({ rating }: { rating: Rating }) {
  if (rating.average === null) {
    return <span className="text-sm text-muted">No ratings yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-content" data-testid="rating-summary">
      <span aria-hidden="true" className="text-accent">
        ★
      </span>{' '}
      {rating.average.toFixed(1)} <span className="font-normal text-muted">({rating.count} {rating.count === 1 ? 'rating' : 'ratings'})</span>
    </span>
  );
}
