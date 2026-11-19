import { Link, NavLink } from 'react-router';
import { COOKS, useCook } from '../cook.ts';
import { useTheme } from '../theme.ts';
import { Icon } from './Icon.tsx';

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-accent-soft text-accent-strong' : 'text-muted hover:bg-surface-sunken hover:text-content'}`;

export function Header() {
  const { theme, toggle } = useTheme();
  const { cook, choose } = useCook();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" className="mr-auto flex items-center gap-3 text-content">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-content shadow-sm">
            <Icon name="book" className="size-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-xl font-bold tracking-tight">RecipeBox</span>
            <span className="hidden text-xs text-muted sm:block">Saffron Lane Supper Club</span>
          </span>
        </Link>
        {/* Below 768px the cook and the theme stay on the line of the name, and the pages go to a line of their own. */}
        <nav aria-label="Main" className="order-last flex w-full items-center gap-1 md:order-none md:w-auto">
          <NavLink to="/" end className={navLink}>
            Recipes
          </NavLink>
          <NavLink to="/recipes/new" className={navLink}>
            New recipe
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {/* The cook picks a name here; the first letter stands in for a photo. */}
          <label className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-1 pl-1 text-xs font-medium text-muted">
            <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-herb-soft text-sm font-bold text-herb">
              {cook.charAt(0)}
            </span>
            <span className="sr-only sm:not-sr-only">Cooking as</span>
            <select className="rounded-full bg-surface py-1 pr-1 text-sm font-semibold text-content" value={cook} onChange={(event) => choose(event.target.value)}>
              {COOKS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <button type="button" className="button size-9 rounded-full p-0" aria-label="Toggle theme" aria-pressed={theme === 'dark'} onClick={toggle}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </div>
    </header>
  );
}
