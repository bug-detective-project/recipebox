# RecipeBox

A cookbook shared by a few cooks: recipes with ingredients and steps, a search by text and by
ingredient, ratings and favorites. It is a game project of
[Bug Detective](https://github.com/bug-detective-project): this branch (`main`) is the app with
every bug fixed; the tickets players get are built from it (see the `qa` branch).

| Part      | Stack                                                                    |
| --------- | ------------------------------------------------------------------------ |
| `client/` | React, Vite, React Router, TanStack Query, React Hook Form, Tailwind CSS |
| `server/` | Node.js, Fastify, Sequelize                                              |
| Database  | PostgreSQL 17                                                            |

## Running it

The app needs a PostgreSQL database and reads its address from `DATABASE_URL`; nothing in the code
knows a fixed address. Inside Bug Detective the database is already there: the app starts it next
to your workspace and sets the variable.

```sh
npm ci
npm run db:reset   # create the tables and the sample cookbook
npm run dev        # the cookbook on http://localhost:5173, the API on http://localhost:3001
```

Outside Bug Detective, start a PostgreSQL 17 yourself and set `DATABASE_URL`, for example
`postgres://postgres:recipebox@localhost:5432/recipebox` (`services.json` has the settings the
game uses).

| Command                                   | What it does                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`                             | Starts the API and the client, both reloading on change                                                |
| `npm run db:reset`                        | Empties the database and puts the sample cookbook back                                                 |
| `npm test`                                | Runs every test (the server's tests use a database of their own, `recipebox_test`, on the same server) |
| `npm run lint` / `npm run lint:fix`       | ESLint, which also formats the TypeScript files                                                        |
| `npm run format` / `npm run format:check` | Prettier, for every other file                                                                         |

## Looking at the data

```sh
psql "$DATABASE_URL"
```

In VS Code, the SQLTools extension (recommended by this project) connects to the same address.

## How it is organized

- **A recipe is a draft or published.** A new recipe starts as a draft; publishing is a step of its
  own (`POST /api/recipes/:id/publish`), and only published recipes are rated.
- **The preparation time travels as text** ("45 min", "1h30") and is kept in minutes. One function
  reads it (`server/src/duration.ts`). The form picks hours and minutes
  (`client/src/components/DurationPicker.tsx`) and writes them as that text
  (`client/src/utils/prepTime.ts`).
- **A photo is a link**, to an image already on the internet or to one served by the client (the
  sample recipes use `client/public/images/`, credited in `client/public/images/CREDITS.md`). The
  form shows a preview of the link. Nothing is uploaded.
- **The filters of the list live in the URL** (`client/src/filters.ts`), so a reload, a shared link
  and the Back button show the same list.
- **The client keeps a cache of what the API answered** (TanStack Query, `client/src/api/`). After a
  change, the mutation says which cached lists are out of date.
- **The form is React Hook Form** (`client/src/components/RecipeForm.tsx`): the ingredients and the
  steps are field arrays, and what the API refuses is shown next to the field it names.
- **There is no login.** Each cook picks a name in the header; the client sends it in the `X-Cook`
  header and the server writes it in the log line of every change to a recipe.
- **The API** (`server/src/routes/`) answers only `localhost` and `127.0.0.1`, validates what it
  receives with the schema of each route (`server/src/schemas.ts`) and logs one JSON line per
  request.
- **The tables** are the models of `server/src/models.ts`; `npm run db:reset` creates them from
  there. After a change to a model, reset the database.
- **Colors are theme tokens** (`client/src/styles.css`): components use `bg-surface`,
  `text-content` and the like, never a fixed color.

## License

[PolyForm Noncommercial 1.0.0](LICENSE).
