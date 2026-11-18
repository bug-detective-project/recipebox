import { Link } from 'react-router';
import { CATEGORY_LABELS } from '../api/types.ts';
import type { RecipeSummary } from '../api/types.ts';
import { formatPrepTime } from '../utils/prepTime.ts';
import { FavoriteButton } from './FavoriteButton.tsx';
import { RatingSummary } from './RatingSummary.tsx';

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-raised" data-testid="recipe-card">
      {recipe.photo ? (
        <img src={recipe.photo.url} alt={recipe.photo.caption} className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="flex aspect-[4/3] w-full items-center justify-center bg-surface text-4xl text-muted">
          🍽
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <h2 className="mr-auto text-lg font-semibold">
            <Link to={`/recipes/${recipe.id}`} className="underline-offset-2 hover:underline">
              {recipe.title}
            </Link>
          </h2>
          <FavoriteButton recipe={recipe} />
        </div>
        <p className="text-sm text-muted">
          {CATEGORY_LABELS[recipe.category]} · {formatPrepTime(recipe.prepMinutes)}
          {recipe.status === 'draft' && <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-xs font-semibold">Draft</span>}
        </p>
        <p className="text-sm">{recipe.description}</p>
        <div className="mt-auto">
          <RatingSummary rating={recipe.rating} />
        </div>
      </div>
    </li>
  );
}
