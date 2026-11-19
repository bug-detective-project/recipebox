/** The last line of every page: whose cookbook this is. */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:px-6">
        <p>
          <span className="font-display font-semibold text-content">Saffron Lane Supper Club</span> · cooking together every Thursday
        </p>
        <p>Recipes are shared by the members of the club.</p>
      </div>
    </footer>
  );
}
