import { useRecipes } from '../api/recipes.ts';
import { CATEGORIES, CATEGORY_LABELS } from '../api/types.ts';
import { RecipeCard } from '../components/RecipeCard.tsx';
import { isCategory, useFilters } from '../filters.ts';

const label = 'flex flex-col gap-1 text-sm font-medium text-muted';

export function RecipesPage() {
  const { filters, change } = useFilters();
  const recipes = useRecipes(filters);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Recipes</h1>
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className={label}>
          Search
          <input className="field" type="search" placeholder="Title, description…" value={filters.q} onChange={(event) => change({ q: event.target.value })} />
        </label>
        <label className={label}>
          Category
          <select className="field" value={filters.category} onChange={(event) => change({ category: isCategory(event.target.value) ? event.target.value : '' })}>
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
          <input className="field" type="search" placeholder="egg, lemon…" value={filters.ingredient} onChange={(event) => change({ ingredient: event.target.value })} />
        </label>
        <label className="flex items-center gap-2 self-end py-2 text-sm font-medium text-muted">
          <input type="checkbox" checked={filters.favorites} onChange={(event) => change({ favorites: event.target.checked })} />
          Only favorites
        </label>
      </form>

      {recipes.isPending && <p className="text-muted">Loading recipes…</p>}
      {recipes.isError && (
        <p role="alert" className="text-danger">
          The recipes could not be loaded.
        </p>
      )}
      {recipes.data && (
        <>
          <p role="status" className="text-sm text-muted" data-testid="recipe-count">
            {recipes.data.length === 1 ? '1 recipe' : `${recipes.data.length} recipes`}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.data.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
