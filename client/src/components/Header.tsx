import { Link, NavLink } from 'react-router';
import { COOKS, useCook } from '../cook.ts';
import { useTheme } from '../theme.ts';

const navLink = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 font-medium ${isActive ? 'bg-surface text-content' : 'text-muted'}`;

export function Header() {
  const { theme, toggle } = useTheme();
  const { cook, choose } = useCook();

  return (
    <header className="border-b border-border bg-surface-raised text-content">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="mr-auto text-xl font-bold text-content">
          RecipeBox
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink to="/" end className={navLink}>
            Recipes
          </NavLink>
          <NavLink to="/recipes/new" className={navLink}>
            New recipe
          </NavLink>
        </nav>
        <label className="flex items-center gap-2 text-sm text-muted">
          Cooking as
          <select className="field py-1" value={cook} onChange={(event) => choose(event.target.value)}>
            {COOKS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="button" aria-label="Toggle theme" aria-pressed={theme === 'dark'} onClick={toggle}>
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
        </button>
      </div>
    </header>
  );
}
