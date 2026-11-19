import { Link } from 'react-router';
import { useRecipes } from '../api/recipes.ts';
import { CATEGORIES, CATEGORY_LABELS } from '../api/types.ts';
import { Icon } from '../components/Icon.tsx';
import { RecipeCard } from '../components/RecipeCard.tsx';
import { isCategory, useFilters } from '../filters.ts';

const label = 'flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase';

export function RecipesPage() {
  const { filters, change } = useFilters();
  const recipes = useRecipes(filters);
  const filtered = filters.q !== '' || filters.category !== '' || filters.ingredient !== '' || filters.favorites;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">The club's cookbook</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Recipes</h1>
          <p className="mt-2 max-w-xl text-muted">What we cooked on Thursdays, with the quantities that worked and what everyone thought of it.</p>
        </div>
        <Link to="/recipes/new" className="button-primary">
          <Icon name="plus" />
          Add a recipe
        </Link>
      </div>

      <form className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1.4fr_auto] lg:items-end" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className={label}>
          Search
          <span className="relative">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input className="field pl-9 text-base font-normal tracking-normal normal-case" type="search" placeholder="Title, description…" value={filters.q} onChange={(event) => change({ q: event.target.value })} />
          </span>
        </label>
        <label className={label}>
          Category
          <select
            className="field text-base font-normal tracking-normal normal-case"
            value={filters.category}
            onChange={(event) => change({ category: isCategory(event.target.value) ? event.target.value : '' })}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Ingredient
          <input
            className="field text-base font-normal tracking-normal normal-case"
            type="search"
            placeholder="egg, lemon…"
            value={filters.ingredient}
            onChange={(event) => change({ ingredient: event.target.value })}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-sm font-semibold text-content shadow-sm has-checked:border-accent has-checked:bg-accent-soft">
          <input type="checkbox" className="size-4 accent-(--accent)" checked={filters.favorites} onChange={(event) => change({ favorites: event.target.checked })} />
          Only favorites
        </label>
      </form>

      {recipes.isPending && <p className="text-muted">Loading recipes…</p>}
      {recipes.isError && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 font-medium text-danger">
          The recipes could not be loaded.
        </p>
      )}
      {recipes.data && (
        <>
          <p role="status" className="text-sm font-medium text-muted" data-testid="recipe-count">
            {recipes.data.length === 1 ? '1 recipe' : `${recipes.data.length} recipes`}
          </p>
          {recipes.data.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon name="search" className="size-7" />
              </span>
              <p className="font-display text-xl font-bold">Nothing in the cookbook matches</p>
              <p className="max-w-sm text-muted">{filtered ? 'Try fewer filters, or another word.' : 'The cookbook is empty. Add the first recipe.'}</p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.data.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
