import { useSetFavorite } from '../api/recipes.ts';

/** The heart of a recipe: filled when it is a favorite, and a click changes it. */
export function FavoriteButton({ recipe }: { recipe: { id: number; title: string; favorite: boolean } }) {
  const setFavorite = useSetFavorite();

  return (
    <button
      type="button"
      className="rounded-lg px-2 py-1 text-xl text-accent disabled:opacity-50"
      aria-label={`Favorite ${recipe.title}`}
      aria-pressed={recipe.favorite}
      disabled={setFavorite.isPending}
      onClick={() => setFavorite.mutate({ id: recipe.id, favorite: !recipe.favorite })}
    >
      <span aria-hidden="true">{recipe.favorite ? '♥' : '♡'}</span>
    </button>
  );
}
