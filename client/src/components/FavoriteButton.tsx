import { useSetFavorite } from '../api/recipes.ts';

/** The heart of a recipe: filled when it is a favorite, and a click changes it. */
export function FavoriteButton({ recipe, className = '' }: { recipe: { id: number; title: string; favorite: boolean }; className?: string }) {
  const setFavorite = useSetFavorite();

  return (
    <button
      type="button"
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-accent shadow-sm transition-transform hover:scale-105 disabled:opacity-50 ${className}`}
      aria-label={`Favorite ${recipe.title}`}
      aria-pressed={recipe.favorite}
      disabled={setFavorite.isPending}
      onClick={() => setFavorite.mutate({ id: recipe.id, favorite: !recipe.favorite })}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill={recipe.favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.600-7.5 10.2-7.5 10.2Z" />
      </svg>
    </button>
  );
}
