import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/http.ts';
import { useDeleteRecipe, usePublishRecipe, useRateRecipe, useRecipe } from '../api/recipes.ts';
import { CATEGORY_LABELS } from '../api/types.ts';
import type { RecipeDetail } from '../api/types.ts';
import { FavoriteButton } from '../components/FavoriteButton.tsx';
import { IngredientList } from '../components/IngredientList.tsx';
import { RatingStars } from '../components/RatingStars.tsx';
import { RatingSummary } from '../components/RatingSummary.tsx';
import { StepList } from '../components/StepList.tsx';
import { formatPrepTime } from '../utils/prepTime.ts';
import { NotFound } from './NotFound.tsx';

const MAX_SERVINGS = 100;

export function RecipePage() {
  const { id } = useParams();
  const recipe = useRecipe(id);

  if (recipe.isPending) {
    return <main className="mx-auto max-w-5xl px-4 py-6 text-muted">Loading recipe…</main>;
  }
  if (recipe.isError) {
    if (recipe.error instanceof ApiError && recipe.error.status === 404) {
      return <NotFound title="Recipe not found" />;
    }
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <p role="alert" className="text-danger">
          The recipe could not be loaded.
        </p>
      </main>
    );
  }
  // A recipe of its own gets a page of its own: the servings start again from the recipe's.
  return <Recipe key={recipe.data.id} recipe={recipe.data} />;
}

function Recipe({ recipe }: { recipe: RecipeDetail }) {
  const navigate = useNavigate();
  const publish = usePublishRecipe();
  const remove = useDeleteRecipe();
  const rate = useRateRecipe();
  // How many servings the cook wants to make; the quantities follow.
  const [servings, setServings] = useState(recipe.servings);
  const [thanks, setThanks] = useState(false);
  const failed = publish.isError || remove.isError || rate.isError;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <Link to="/" className="self-start text-accent underline">
        All recipes
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        {recipe.photo ? (
          <img src={recipe.photo.url} alt={recipe.photo.caption} className="aspect-[4/3] w-full rounded-xl border border-border object-cover" />
        ) : (
          <div aria-hidden="true" className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-border bg-surface-raised text-6xl text-muted">
            🍽
          </div>
        )}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {CATEGORY_LABELS[recipe.category]} · {formatPrepTime(recipe.prepMinutes)}
            {recipe.status === 'draft' && <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-xs font-semibold">Draft</span>}
          </p>
          <div className="flex items-start gap-2">
            <h1 className="mr-auto text-3xl font-bold">{recipe.title}</h1>
            <FavoriteButton recipe={recipe} />
          </div>
          <p className="text-muted">{recipe.description || 'No description yet.'}</p>
          <RatingSummary rating={recipe.rating} />
          <div className="flex flex-wrap gap-2">
            <Link to={`/recipes/${recipe.id}/edit`} className="button">
              Edit
            </Link>
            {recipe.status === 'draft' && (
              <button type="button" className="button-primary" disabled={publish.isPending} onClick={() => publish.mutate(recipe.id)}>
                Publish
              </button>
            )}
            <button type="button" className="button text-danger" disabled={remove.isPending} onClick={() => remove.mutate(recipe.id, { onSuccess: () => void navigate('/') })}>
              Delete
            </button>
          </div>
          {failed && (
            <p role="alert" className="text-danger">
              That did not work. Try again.
            </p>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="ingredients-title">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="ingredients-title" className="mr-auto text-xl font-semibold">
            Ingredients
          </h2>
          <div role="group" aria-label="Servings" className="flex items-center gap-2">
            <button type="button" className="button px-3 py-1" aria-label="Fewer servings" disabled={servings <= 1} onClick={() => setServings(servings - 1)}>
              −
            </button>
            <span data-testid="servings">
              {servings} {servings === 1 ? 'serving' : 'servings'}
            </span>
            <button type="button" className="button px-3 py-1" aria-label="More servings" disabled={servings >= MAX_SERVINGS} onClick={() => setServings(servings + 1)}>
              +
            </button>
          </div>
        </div>
        <IngredientList ingredients={recipe.ingredients} recipeServings={recipe.servings} servings={servings} />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-xl font-semibold">
          Steps
        </h2>
        <StepList steps={recipe.steps} />
      </section>

      {recipe.status === 'published' && (
        <section className="flex flex-col gap-2" aria-labelledby="rate-title">
          <h2 id="rate-title" className="text-xl font-semibold">
            Did you cook it?
          </h2>
          <RatingStars disabled={rate.isPending} onRate={(stars) => rate.mutate({ id: recipe.id, stars }, { onSuccess: () => setThanks(true) })} />
          {thanks && (
            <p role="status" className="text-sm text-muted">
              Thanks for rating!
            </p>
          )}
        </section>
      )}
    </main>
  );
}
