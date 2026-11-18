import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '../api/http.ts';
import { useCreateRecipe, useRecipe, useUpdateRecipe } from '../api/recipes.ts';
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
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">New recipe</h1>
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
    return <main className="mx-auto max-w-3xl px-4 py-6 text-muted">Loading recipe…</main>;
  }
  if (recipe.isError) {
    if (recipe.error instanceof ApiError && recipe.error.status === 404) {
      return <NotFound title="Recipe not found" />;
    }
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p role="alert" className="text-danger">
          The recipe could not be loaded.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <Link to={`/recipes/${recipe.data.id}`} className="self-start text-accent underline">
        Back to the recipe
      </Link>
      <h1 className="text-2xl font-bold">Edit recipe</h1>
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
