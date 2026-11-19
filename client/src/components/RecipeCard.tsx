import { Link } from 'react-router';
import { CATEGORY_LABELS } from '../api/types.ts';
import type { RecipeSummary } from '../api/types.ts';
import { formatPrepTime } from '../utils/prepTime.ts';
import { FavoriteButton } from './FavoriteButton.tsx';
import { Icon } from './Icon.tsx';
import { RatingSummary } from './RatingSummary.tsx';
import { RecipePhoto } from './RecipePhoto.tsx';

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <li className="group card relative flex flex-col overflow-hidden transition-shadow hover:shadow-lift" data-testid="recipe-card">
      <div className="relative overflow-hidden">
        <RecipePhoto photo={recipe.photo} className="transition-transform duration-300 group-hover:scale-[1.03]" />
        {recipe.status === 'draft' && <span className="absolute top-3 left-3 rounded-full bg-content/85 px-2.5 py-1 text-xs font-bold tracking-wide text-surface-raised uppercase">Draft</span>}
        <FavoriteButton recipe={recipe} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="eyebrow">
          {CATEGORY_LABELS[recipe.category]} · {formatPrepTime(recipe.prepMinutes)}
        </p>
        <h2 className="font-display text-xl leading-snug font-bold">
          {/* The whole card opens the recipe: the link stretches over it, under the heart. */}
          <Link to={`/recipes/${recipe.id}`} className="underline-offset-4 after:absolute after:inset-0 hover:underline">
            {recipe.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{recipe.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <RatingSummary rating={recipe.rating} />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Icon name="users" />
            {recipe.servings}
          </span>
        </div>
      </div>
    </li>
  );
}
