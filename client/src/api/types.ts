export const CATEGORIES = ['breakfast', 'main', 'dessert', 'snack', 'drink'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  breakfast: 'Breakfast',
  main: 'Main course',
  dessert: 'Dessert',
  snack: 'Snack',
  drink: 'Drink',
};

export type Status = 'draft' | 'published';

export interface Photo {
  url: string;
  caption: string;
}

export interface RatingSummary {
  /** One decimal place; null while nobody rated the recipe. */
  average: number | null;
  count: number;
}

export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  /** Empty for things that are counted, such as eggs. */
  unit: string;
}

export interface Step {
  id: number;
  text: string;
}

/** A recipe as the list shows it. */
export interface RecipeSummary {
  id: number;
  title: string;
  description: string;
  category: Category;
  status: Status;
  servings: number;
  prepMinutes: number;
  photo: Photo | null;
  rating: RatingSummary;
  favorite: boolean;
}

/** A recipe with everything needed to cook it. */
export interface RecipeDetail extends RecipeSummary {
  ingredients: Ingredient[];
  steps: Step[];
}

/** What the API takes to create a recipe or to save its changes. */
export interface RecipeInput {
  title: string;
  description: string;
  category: Category;
  servings: number;
  /** As the cook typed it: "45 min", "1h30". */
  prepTime: string;
  photo: { url: string; caption: string } | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: string[];
}

export interface RecipeFilters {
  q: string;
  category: Category | '';
  ingredient: string;
  favorites: boolean;
}
