import { Link } from 'react-router';

export function NotFound({ title = 'Page not found' }: { title?: string }) {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Link to="/" className="button-primary">
        Back to the recipes
      </Link>
    </main>
  );
}
