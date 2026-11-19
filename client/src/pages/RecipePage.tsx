import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/http.ts';
import { useDeleteRecipe, usePublishRecipe, useRateRecipe, useRecipe } from '../api/recipes.ts';
import { CATEGORY_LABELS } from '../api/types.ts';
import type { RecipeDetail } from '../api/types.ts';
import { FavoriteButton } from '../components/FavoriteButton.tsx';
import { Icon } from '../components/Icon.tsx';
import type { IconName } from '../components/Icon.tsx';
import { IngredientList } from '../components/IngredientList.tsx';
import { RatingStars } from '../components/RatingStars.tsx';
import { RatingSummary } from '../components/RatingSummary.tsx';
import { RecipePhoto } from '../components/RecipePhoto.tsx';
import { StepList } from '../components/StepList.tsx';
import { formatPrepTime } from '../utils/prepTime.ts';
import { NotFound } from './NotFound.tsx';

const MAX_SERVINGS = 100;

export function RecipePage() {
  const { id } = useParams();
  const recipe = useRecipe(id);

  if (recipe.isPending) {
    return <main className="mx-auto max-w-6xl px-4 py-8 text-muted sm:px-6">Loading recipe…</main>;
  }
  if (recipe.isError) {
    if (recipe.error instanceof ApiError && recipe.error.status === 404) {
      return <NotFound title="Recipe not found" />;
    }
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 font-medium text-danger">
          The recipe could not be loaded.
        </p>
      </main>
    );
  }
  // A recipe of its own gets a page of its own: the servings start again from the recipe's.
  return <Recipe key={recipe.data.id} recipe={recipe.data} />;
}

/** One number of the recipe with its name: the time it takes, how many it feeds. */
function Fact({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name={icon} className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
        <p className="font-semibold">{children}</p>
      </div>
    </div>
  );
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
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent underline-offset-4 hover:underline">
        <Icon name="arrowLeft" />
        All recipes
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <RecipePhoto photo={recipe.photo} className="rounded-3xl border border-border shadow-card" />
        <div className="flex flex-col gap-4">
          <p className="eyebrow flex flex-wrap items-center gap-2">
            {CATEGORY_LABELS[recipe.category]} · {formatPrepTime(recipe.prepMinutes)}
            {recipe.status === 'draft' && <span className="rounded-full bg-content/85 px-2.5 py-1 text-xs font-bold tracking-wide text-surface-raised">Draft</span>}
          </p>
          <div className="flex items-start gap-3">
            <h1 className="mr-auto font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">{recipe.title}</h1>
            <FavoriteButton recipe={recipe} className="mt-1.5" />
          </div>
          <p className="text-lg leading-relaxed text-muted">{recipe.description || 'No description yet.'}</p>
          <div className="card flex flex-wrap items-center gap-x-8 gap-y-4 p-4">
            <Fact icon="clock" label="Time">
              {formatPrepTime(recipe.prepMinutes)}
            </Fact>
            <Fact icon="users" label="Makes">
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </Fact>
            <div className="leading-tight">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Rating</p>
              <RatingSummary rating={recipe.rating} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {recipe.status === 'draft' && (
              <button type="button" className="button-primary" disabled={publish.isPending} onClick={() => publish.mutate(recipe.id)}>
                <Icon name="send" />
                Publish
              </button>
            )}
            <Link to={`/recipes/${recipe.id}/edit`} className="button">
              <Icon name="pencil" />
              Edit
            </Link>
            <button type="button" className="button-danger" disabled={remove.isPending} onClick={() => remove.mutate(recipe.id, { onSuccess: () => void navigate('/') })}>
              <Icon name="trash" />
              Delete
            </button>
          </div>
          {failed && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 font-medium text-danger">
              That did not work. Try again.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-start">
        <section className="card flex flex-col gap-3 p-5 sm:p-6 lg:sticky lg:top-24" aria-labelledby="ingredients-title">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="ingredients-title" className="mr-auto font-display text-2xl font-bold">
              Ingredients
            </h2>
            <div role="group" aria-label="Servings" className="flex items-center gap-1 rounded-full border border-border-strong bg-surface p-1">
              <button type="button" className="flex size-8 items-center justify-center rounded-full text-content transition-colors hover:bg-surface-sunken disabled:opacity-40" aria-label="Fewer servings" disabled={servings <= 1} onClick={() => setServings(servings - 1)}>
                <Icon name="minus" />
              </button>
              <span className="min-w-24 text-center text-sm font-semibold" data-testid="servings">
                {servings} {servings === 1 ? 'serving' : 'servings'}
              </span>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full text-content transition-colors hover:bg-surface-sunken disabled:opacity-40"
                aria-label="More servings"
                disabled={servings >= MAX_SERVINGS}
                onClick={() => setServings(servings + 1)}
              >
                <Icon name="plus" />
              </button>
            </div>
          </div>
          <IngredientList ingredients={recipe.ingredients} recipeServings={recipe.servings} servings={servings} />
        </section>

        <div className="flex flex-col gap-6">
          <section className="card flex flex-col gap-5 p-5 sm:p-6" aria-labelledby="steps-title">
            <h2 id="steps-title" className="font-display text-2xl font-bold">
              Steps
            </h2>
            <StepList steps={recipe.steps} />
          </section>

          {recipe.status === 'published' && (
            <section className="card flex flex-wrap items-center gap-x-6 gap-y-3 bg-accent-soft p-5 sm:p-6" aria-labelledby="rate-title">
              <div className="mr-auto">
                <h2 id="rate-title" className="font-display text-2xl font-bold">
                  Did you cook it?
                </h2>
                <p className="text-sm text-muted">Tell the club how it turned out.</p>
              </div>
              <RatingStars disabled={rate.isPending} onRate={(stars) => rate.mutate({ id: recipe.id, stars }, { onSuccess: () => setThanks(true) })} />
              {thanks && (
                <p role="status" className="w-full text-sm font-semibold text-herb">
                  Thanks for rating!
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
