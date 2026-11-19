import { Op } from 'sequelize';
import type { Sequelize, Transaction, WhereOptions } from 'sequelize';
import { parsePrepTime } from './duration.ts';
import { ConflictError, InvalidError, NotFoundError } from './errors.ts';
import { Favorite, Ingredient, Photo, Rating, Recipe, Step } from './models.ts';
import type { Category, Status } from './models.ts';

export interface RatingSummary {
  /** One decimal place; null while nobody rated the recipe. */
  average: number | null;
  count: number;
}

export interface RecipeSummary {
  id: number;
  title: string;
  description: string;
  category: Category;
  status: Status;
  servings: number;
  prepMinutes: number;
  photo: { url: string; caption: string } | null;
  rating: RatingSummary;
  favorite: boolean;
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: { id: number; name: string; quantity: number; unit: string }[];
  steps: { id: number; text: string }[];
}

/** What a cook sends to create a recipe or to save its changes. */
export interface RecipeInput {
  title: string;
  description?: string;
  category: Category;
  servings: number;
  /** As the cook typed it: "45 min", "1h30". */
  prepTime: string;
  photo?: { url: string; caption?: string } | null;
  ingredients: { name: string; quantity: number; unit?: string }[];
  steps: string[];
}

export interface ListFilters {
  q?: string;
  category?: Category;
  ingredient?: string;
  favorites?: boolean;
}

/** Turns what the cook typed in a search box into a pattern: the text anywhere, any case. */
const containing = (text: string) => ({ [Op.iLike]: `%${text.replace(/[\\%_]/g, '\\$&')}%` });

async function ratingsOf(ids: number[]): Promise<Map<number, RatingSummary>> {
  const stars = new Map<number, number[]>();
  for (const rating of await Rating.findAll({ where: { recipeId: ids } })) {
    stars.set(rating.recipeId, [...(stars.get(rating.recipeId) ?? []), rating.stars]);
  }
  return new Map(
    ids.map((id) => {
      const given = stars.get(id) ?? [];
      const average = given.length === 0 ? null : Math.round((given.reduce((sum, value) => sum + value, 0) / given.length) * 10) / 10;
      return [id, { average, count: given.length }];
    }),
  );
}

async function favoriteIds(): Promise<Set<number>> {
  return new Set((await Favorite.findAll()).map((favorite) => favorite.recipeId));
}

function summaryOf(recipe: Recipe, rating: RatingSummary, favorite: boolean): RecipeSummary {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    status: recipe.status,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    photo: recipe.photo ? { url: recipe.photo.url, caption: recipe.photo.caption } : null,
    rating,
    favorite,
  };
}

/** The recipes that match every filter given, by title. */
export async function listRecipes(filters: ListFilters = {}): Promise<RecipeSummary[]> {
  const where: WhereOptions<Recipe> = {};
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.q) {
    // The search reads the title, the description and what the photo shows.
    Object.assign(where, { [Op.or]: [{ title: containing(filters.q) }, { description: containing(filters.q) }, { '$photo.caption$': containing(filters.q) }] });
  }
  const favorites = await favoriteIds();
  let ids: number[] | undefined;
  if (filters.ingredient) {
    const matches = await Ingredient.findAll({ attributes: ['recipeId'], where: { name: containing(filters.ingredient) } });
    ids = matches.map((ingredient) => ingredient.recipeId);
  }
  if (filters.favorites) {
    ids = (ids ?? [...favorites]).filter((id) => favorites.has(id));
  }
  if (ids) {
    where.id = ids;
  }

  const recipes = await Recipe.findAll({
    where,
    // A recipe without a photo is still a recipe: the join must not leave it out.
    include: [{ model: Photo, as: 'photo', required: false }],
    order: [
      ['title', 'ASC'],
      ['id', 'ASC'],
    ],
  });
  const ratings = await ratingsOf(recipes.map((recipe) => recipe.id));
  return recipes.map((recipe) => summaryOf(recipe, ratings.get(recipe.id)!, favorites.has(recipe.id)));
}

async function loadRecipe(id: number): Promise<Recipe> {
  const recipe = Number.isInteger(id)
    ? await Recipe.findByPk(id, {
        include: [
          { model: Photo, as: 'photo' },
          { model: Ingredient, as: 'ingredients' },
          { model: Step, as: 'steps' },
        ],
        order: [
          [{ model: Ingredient, as: 'ingredients' }, 'position', 'ASC'],
          [{ model: Step, as: 'steps' }, 'position', 'ASC'],
        ],
      })
    : null;
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }
  return recipe;
}

export async function getRecipe(id: number): Promise<RecipeDetail> {
  const recipe = await loadRecipe(id);
  const rating = (await ratingsOf([recipe.id])).get(recipe.id)!;
  return {
    ...summaryOf(recipe, rating, (await favoriteIds()).has(recipe.id)),
    ingredients: recipe.ingredients!.map(({ id: ingredientId, name, quantity, unit }) => ({ id: ingredientId, name, quantity, unit })),
    steps: recipe.steps!.map(({ id: stepId, text }) => ({ id: stepId, text })),
  };
}

/** The columns of the recipe itself, from what the cook sent. */
function fieldsOf(input: RecipeInput) {
  const prepMinutes = parsePrepTime(input.prepTime);
  if (prepMinutes === undefined) {
    throw new InvalidError('Some fields are not valid', { prepTime: 'Write the time like 45 min or 1h30' });
  }
  return {
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    category: input.category,
    servings: input.servings,
    prepMinutes,
  };
}

/** Replaces the ingredients, the steps and the photo of a recipe with the ones the cook sent. */
async function writeParts(recipeId: number, input: RecipeInput, transaction: Transaction): Promise<void> {
  await Ingredient.destroy({ where: { recipeId }, transaction });
  await Step.destroy({ where: { recipeId }, transaction });
  await Photo.destroy({ where: { recipeId }, transaction });
  await Ingredient.bulkCreate(
    input.ingredients.map(({ name, quantity, unit }, position) => ({ recipeId, position, name: name.trim(), quantity, unit: (unit ?? '').trim() })),
    { transaction },
  );
  await Step.bulkCreate(
    input.steps.map((text, position) => ({ recipeId, position, text: text.trim() })),
    { transaction },
  );
  if (input.photo) {
    await Photo.create({ recipeId, url: input.photo.url.trim(), caption: (input.photo.caption ?? '').trim() }, { transaction });
  }
}

/** A new recipe starts as a draft. */
export async function createRecipe(sequelize: Sequelize, input: RecipeInput): Promise<RecipeDetail> {
  const fields = fieldsOf(input);
  // All or nothing: a recipe is never saved with half of its ingredients.
  const id = await sequelize.transaction(async (transaction) => {
    const recipe = await Recipe.create(fields, { transaction });
    await writeParts(recipe.id, input, transaction);
    return recipe.id;
  });
  return getRecipe(id);
}

/** Saves the changes of a cook. Publishing is a step of its own: an edit never changes the status. */
export async function updateRecipe(sequelize: Sequelize, id: number, input: RecipeInput): Promise<RecipeDetail> {
  const recipe = await loadRecipe(id);
  const fields = fieldsOf(input);
  await sequelize.transaction(async (transaction) => {
    await recipe.update(fields, { transaction });
    await writeParts(recipe.id, input, transaction);
  });
  return getRecipe(recipe.id);
}

export async function deleteRecipe(id: number): Promise<void> {
  const deleted = Number.isInteger(id) ? await Recipe.destroy({ where: { id } }) : 0;
  if (deleted === 0) {
    throw new NotFoundError('Recipe not found');
  }
}

/** Shows a draft to everyone. A recipe needs something to cook with and something to do. */
export async function publishRecipe(id: number): Promise<RecipeDetail> {
  const recipe = await loadRecipe(id);
  if (recipe.ingredients!.length === 0 || recipe.steps!.length === 0) {
    throw new ConflictError('A recipe needs at least one ingredient and one step to be published');
  }
  await recipe.update({ status: 'published' });
  return getRecipe(recipe.id);
}

/** Adds one rating. Only published recipes are rated: a draft is not finished yet. */
export async function rateRecipe(id: number, stars: number): Promise<RatingSummary> {
  const recipe = await loadRecipe(id);
  if (recipe.status !== 'published') {
    throw new ConflictError('Only published recipes can be rated');
  }
  await Rating.create({ recipeId: recipe.id, stars });
  return (await ratingsOf([recipe.id])).get(recipe.id)!;
}

/** Marking twice is the same as marking once. */
export async function addFavorite(id: number): Promise<void> {
  const recipe = await loadRecipe(id);
  await Favorite.findOrCreate({ where: { recipeId: recipe.id } });
}

/** Removing a mark that is not there is not an error. */
export async function removeFavorite(id: number): Promise<void> {
  const recipe = await loadRecipe(id);
  await Favorite.destroy({ where: { recipeId: recipe.id } });
}
