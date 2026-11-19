import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/http.ts';
import { useCreateRecipe, useRecipe, useUpdateRecipe } from '../api/recipes.ts';
import { Icon } from '../components/Icon.tsx';
import { RecipeForm } from '../components/RecipeForm.tsx';
import { NotFound } from './NotFound.tsx';

/** "New recipe" (/recipes/new) and "Edit recipe" (/recipes/:id/edit): the same form. */
export function RecipeFormPage() {
  const { id } = useParams();
  return id === undefined ? <NewRecipe /> : <EditRecipe id={id} />;
}

function NewRecipe() {
  const navigate = useNavigate();
  const create = useCreateRecipe();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="eyebrow">The club's cookbook</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">New recipe</h1>
        <p className="mt-2 text-muted">It is saved as a draft. Publish it from its page when it is ready for the club.</p>
      </div>
      <RecipeForm
        save={async (input) => {
          const created = await create.mutateAsync(input);
          await navigate(`/recipes/${created.id}`);
        }}
      />
    </main>
  );
}

function EditRecipe({ id }: { id: string }) {
  const navigate = useNavigate();
  const recipe = useRecipe(id);
  const update = useUpdateRecipe();

  if (recipe.isPending) {
    return <main className="mx-auto max-w-3xl px-4 py-8 text-muted sm:px-6">Loading recipe…</main>;
  }
  if (recipe.isError) {
    if (recipe.error instanceof ApiError && recipe.error.status === 404) {
      return <NotFound title="Recipe not found" />;
    }
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 font-medium text-danger">
          The recipe could not be loaded.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link to={`/recipes/${recipe.data.id}`} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent underline-offset-4 hover:underline">
        <Icon name="arrowLeft" />
        Back to the recipe
      </Link>
      <div>
        <p className="eyebrow">{recipe.data.title}</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Edit recipe</h1>
      </div>
      {/* The form starts from the recipe as it was when the page opened. */}
      <RecipeForm
        key={recipe.data.id}
        editing={recipe.data}
        save={async (input) => {
          await update.mutateAsync({ id: recipe.data.id, input });
          await navigate(`/recipes/${recipe.data.id}`);
        }}
      />
    </main>
  );
}
