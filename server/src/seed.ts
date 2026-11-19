import { Favorite, Ingredient, Photo, Rating, Recipe, Step } from './models.ts';
import type { Category, Status } from './models.ts';

interface SampleRecipe {
  title: string;
  description: string;
  category: Category;
  status: Status;
  servings: number;
  prepMinutes: number;
  /** "quantity|unit|name" per ingredient. */
  ingredients: string[];
  steps: string[];
  photo?: { url: string; caption: string };
  ratings?: number[];
  favorite?: boolean;
}

const photo = (file: string, caption: string) => ({ url: `/images/${file}.jpg`, caption });

/** The cookbook a new database starts with. The ids follow this order, from 1. */
export const SAMPLE_RECIPES: SampleRecipe[] = [
  {
    title: 'Banana Pancakes',
    description: 'Soft pancakes for a slow morning, sweet enough without syrup.',
    category: 'breakfast',
    status: 'published',
    servings: 4,
    prepMinutes: 25,
    ingredients: ['2||ripe banana', '2||egg', '200|g|flour', '250|ml|milk', '1|tbsp|butter'],
    steps: ['Mash the bananas with a fork until almost smooth.', 'Whisk in the eggs and the milk, then fold in the flour.', 'Melt the butter in a pan over medium heat.', 'Pour a ladle of batter per pancake and cook two minutes per side.'],
    photo: photo('banana-pancakes', 'A stack of pancakes with banana slices on top'),
    ratings: [5, 4, 5],
    favorite: true,
  },
  {
    title: 'Overnight Oats',
    description: 'Mixed the night before, ready when you wake up.',
    category: 'breakfast',
    status: 'published',
    servings: 2,
    prepMinutes: 10,
    ingredients: ['100|g|rolled oats', '250|ml|milk', '1|tbsp|honey', '50|g|berries'],
    steps: ['Stir the oats, the milk and the honey in a jar.', 'Close the jar and leave it in the fridge overnight.', 'Top with the berries before serving.'],
    photo: photo('overnight-oats', 'A bowl of oats topped with berries'),
    ratings: [4, 4],
  },
  {
    title: 'Garlic Butter Pasta',
    description: 'Five ingredients and one pan: the weeknight classic.',
    category: 'main',
    status: 'published',
    servings: 2,
    prepMinutes: 20,
    ingredients: ['200|g|spaghetti', '3|clove|garlic', '40|g|butter', '30|g|parmesan', '1|pinch|chili flakes'],
    steps: ['Cook the spaghetti in salted water until al dente.', 'Melt the butter and fry the sliced garlic until golden.', 'Toss the pasta in the pan with a splash of its water.', 'Serve with the parmesan and the chili flakes.'],
    ratings: [5, 5, 4, 5],
  },
  {
    title: 'Roast Chicken with Lemon',
    description: 'A whole bird, crisp outside and juicy inside, for a Sunday table.',
    category: 'main',
    status: 'published',
    servings: 6,
    prepMinutes: 90,
    ingredients: ['1||whole chicken', '2||lemon', '4|clove|garlic', '2|tbsp|olive oil', '1|tsp|salt'],
    steps: ['Heat the oven to 200°C.', 'Rub the chicken with the oil and the salt, and fill it with the lemons and the garlic.', 'Roast for one hour and fifteen minutes, basting twice.', 'Rest for ten minutes before carving.'],
    photo: photo('roast-chicken', 'A golden roast chicken fresh from the oven'),
    ratings: [5, 4],
    favorite: true,
  },
  {
    title: 'Vegetable Curry',
    description: 'Whatever vegetables are left in the fridge, in a coconut sauce.',
    category: 'main',
    status: 'published',
    servings: 4,
    prepMinutes: 45,
    ingredients: ['1||onion', '2|clove|garlic', '400|ml|coconut milk', '2|tbsp|curry paste', '500|g|mixed vegetables', '300|g|rice'],
    steps: ['Fry the chopped onion and the garlic until soft.', 'Stir in the curry paste for one minute.', 'Add the vegetables and the coconut milk and simmer for twenty minutes.', 'Serve over the cooked rice.'],
    photo: photo('vegetable-curry', 'A plate of curry with carrots, potatoes and rice'),
    ratings: [4, 3, 4],
  },
  {
    title: 'Chocolate Mug Cake',
    description: 'A cake for one, from the cupboard to the spoon in five minutes.',
    category: 'dessert',
    status: 'published',
    servings: 1,
    prepMinutes: 5,
    ingredients: ['4|tbsp|flour', '2|tbsp|cocoa powder', '2|tbsp|sugar', '1||egg', '3|tbsp|milk'],
    steps: ['Mix everything in a large mug until smooth.', 'Microwave on high for ninety seconds.', 'Let it cool for a minute: the middle is very hot.'],
    photo: photo('mug-cake', 'A slice of dark chocolate cake'),
    ratings: [5, 5, 5, 4],
    favorite: true,
  },
  {
    title: 'Lemon Tart',
    description: 'A sharp lemon cream in a buttery crust.',
    category: 'dessert',
    status: 'published',
    servings: 8,
    prepMinutes: 80,
    ingredients: ['250|g|flour', '125|g|butter', '3||egg', '150|g|sugar', '3||lemon'],
    steps: ['Rub the butter into the flour, add a little cold water and chill the dough for thirty minutes.', 'Line a tart tin with the dough and bake it blind at 180°C for fifteen minutes.', 'Whisk the eggs, the sugar and the juice of the lemons.', 'Pour the cream into the crust and bake for twenty minutes more.'],
    ratings: [4, 5],
  },
  {
    title: 'Hummus',
    description: 'Smooth chickpea dip, better than any tub from the shop.',
    category: 'snack',
    status: 'published',
    servings: 6,
    prepMinutes: 15,
    ingredients: ['400|g|chickpeas', '2|tbsp|tahini', '1|clove|garlic', '1||lemon', '3|tbsp|olive oil'],
    steps: ['Drain the chickpeas and keep some of the liquid.', 'Blend everything with the juice of the lemon until smooth.', 'Loosen with the liquid of the chickpeas, a spoon at a time.'],
    photo: photo('hummus', 'A plate of hummus with olive oil and paprika'),
    ratings: [4],
  },
  {
    title: 'Cheese Toastie',
    description: 'Crisp bread and melted cheese: nothing else.',
    category: 'snack',
    status: 'published',
    servings: 1,
    prepMinutes: 10,
    ingredients: ['2|slice|bread', '60|g|cheddar', '1|tsp|butter'],
    steps: ['Butter the outside of both slices.', 'Put the cheese between them and fry three minutes per side.'],
  },
  {
    title: 'Iced Mint Tea',
    description: 'Cold, green and barely sweet.',
    category: 'drink',
    status: 'published',
    servings: 4,
    prepMinutes: 15,
    ingredients: ['1|l|water', '3|bag|green tea', '1|bunch|mint', '2|tbsp|honey'],
    steps: ['Steep the tea and the mint in hot water for five minutes.', 'Stir in the honey, then cool it down with ice.'],
    photo: photo('mint-tea', 'A tall glass of iced tea with a sprig of mint'),
    ratings: [3, 4],
  },
  {
    title: 'Slow Beef Stew',
    description: 'Three hours on a low heat, and the meat falls apart.',
    category: 'main',
    status: 'draft',
    servings: 6,
    prepMinutes: 200,
    ingredients: ['800|g|beef chuck', '2||onion', '3||carrot', '500|ml|beef stock'],
    steps: ['Brown the beef in batches.', 'Add the vegetables and the stock, cover and simmer for three hours.'],
  },
  {
    title: 'Egg Custard',
    description: 'Still testing the oven time on this one.',
    category: 'dessert',
    status: 'draft',
    servings: 4,
    prepMinutes: 50,
    ingredients: ['4||egg', '500|ml|milk', '80|g|sugar'],
    steps: ['Whisk everything and strain it into a dish.', 'Bake in a water bath at 150°C until just set.'],
    photo: photo('egg-custard', 'A baked custard with nutmeg on top'),
  },
];

/** Inserts the sample cookbook into an empty database. */
export async function seedDatabase(): Promise<void> {
  for (const sample of SAMPLE_RECIPES) {
    const { ingredients, steps, photo: picture, ratings = [], favorite, ...fields } = sample;
    const recipe = await Recipe.create(fields);
    const recipeId = recipe.id;
    await Ingredient.bulkCreate(
      ingredients.map((line, position) => {
        const [quantity, unit, name] = line.split('|') as [string, string, string];
        return { recipeId, position, name, quantity: Number(quantity), unit };
      }),
    );
    await Step.bulkCreate(steps.map((text, position) => ({ recipeId, position, text })));
    if (picture) {
      await Photo.create({ recipeId, ...picture });
    }
    await Rating.bulkCreate(ratings.map((stars) => ({ recipeId, stars })));
    if (favorite) {
      await Favorite.create({ recipeId });
    }
  }
}
