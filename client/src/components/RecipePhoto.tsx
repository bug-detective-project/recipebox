import type { Photo } from '../api/types.ts';
import { Icon } from './Icon.tsx';

/** The photo of a recipe, or a quiet place holder for a recipe that has none yet. */
export function RecipePhoto({ photo, className = '' }: { photo: Photo | null; className?: string }) {
  if (photo) {
    return <img src={photo.url} alt={photo.caption} className={`aspect-[4/3] w-full object-cover ${className}`} />;
  }
  return (
    <div aria-hidden="true" className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-surface-sunken text-muted ${className}`}>
      <Icon name="utensils" className="size-9 opacity-60" />
      <span className="text-xs font-medium tracking-wide uppercase opacity-80">No photo yet</span>
    </div>
  );
}
