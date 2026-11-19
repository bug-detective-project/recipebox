import { useState } from 'react';
import { Icon } from './Icon.tsx';

/**
 * What the photo link shows, as soon as it is typed or pasted: the image, or a word that the link
 * does not open one. The parent gives it a new `key` per link, so a new link starts again.
 */
export function PhotoPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const link = url.trim();

  if (link === '') {
    return (
      <div aria-hidden="true" className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-sunken text-muted">
        <Icon name="image" className="size-8 opacity-60" />
        <span className="text-xs font-medium tracking-wide uppercase">The photo shows here</span>
      </div>
    );
  }
  if (failed) {
    return (
      <p role="alert" className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-danger/30 bg-danger-soft p-4 text-center text-sm font-medium text-danger" data-testid="photo-preview-error">
        This link does not open an image. Check that it is the link of the image itself, not of the page around it.
      </p>
    );
  }
  return <img src={link} alt="Preview of the photo" className="aspect-[4/3] w-full rounded-xl border border-border object-cover" data-testid="photo-preview" onError={() => setFailed(true)} />;
}
