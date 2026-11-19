import { DataTypes, Model } from 'sequelize';
import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute, Sequelize } from 'sequelize';

export const CATEGORIES = ['breakfast', 'main', 'dessert', 'snack', 'drink'] as const;
export type Category = (typeof CATEGORIES)[number];

/** A draft is still being written; a published recipe is the one the others cook from and rate. */
export type Status = 'draft' | 'published';

// The fields are `declare`d: Sequelize defines them itself, and a real class field would hide them.

export class Recipe extends Model<InferAttributes<Recipe>, InferCreationAttributes<Recipe>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare category: Category;
  declare status: CreationOptional<Status>;
  /** How many people the quantities of the ingredients feed. */
  declare servings: number;
  declare prepMinutes: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare ingredients?: NonAttribute<Ingredient[]>;
  declare steps?: NonAttribute<Step[]>;
  declare photo?: NonAttribute<Photo | null>;
}

export class Ingredient extends Model<InferAttributes<Ingredient>, InferCreationAttributes<Ingredient>> {
  declare id: CreationOptional<number>;
  declare recipeId: ForeignKey<Recipe['id']>;
  /** The place in the list, from 0. */
  declare position: number;
  declare name: string;
  declare quantity: number;
  /** "g", "cup", "tbsp"; empty for things that are counted, such as eggs. */
  declare unit: string;
}

export class Step extends Model<InferAttributes<Step>, InferCreationAttributes<Step>> {
  declare id: CreationOptional<number>;
  declare recipeId: ForeignKey<Recipe['id']>;
  declare position: number;
  declare text: string;
}

export class Photo extends Model<InferAttributes<Photo>, InferCreationAttributes<Photo>> {
  declare id: CreationOptional<number>;
  declare recipeId: ForeignKey<Recipe['id']>;
  declare url: string;
  /** What the photo shows, in words: the search reads it too. */
  declare caption: string;
}

export class Rating extends Model<InferAttributes<Rating>, InferCreationAttributes<Rating>> {
  declare id: CreationOptional<number>;
  declare recipeId: ForeignKey<Recipe['id']>;
  declare stars: number;
}

export class Favorite extends Model<InferAttributes<Favorite>, InferCreationAttributes<Favorite>> {
  declare id: CreationOptional<number>;
  declare recipeId: ForeignKey<Recipe['id']>;
}

const id = { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true } as const;

/** Tells Sequelize the tables and how they point to each other. */
export function defineModels(sequelize: Sequelize): void {
  Recipe.init(
    {
      id,
      title: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
      category: { type: DataTypes.STRING(20), allowNull: false },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'draft' },
      servings: { type: DataTypes.INTEGER, allowNull: false },
      prepMinutes: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'recipes', underscored: true },
  );
  Ingredient.init(
    {
      id,
      position: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(80), allowNull: false },
      quantity: { type: DataTypes.FLOAT, allowNull: false },
      unit: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '' },
    },
    { sequelize, tableName: 'ingredients', underscored: true, timestamps: false },
  );
  Step.init(
    {
      id,
      position: { type: DataTypes.INTEGER, allowNull: false },
      text: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, tableName: 'steps', underscored: true, timestamps: false },
  );
  Photo.init(
    {
      id,
      url: { type: DataTypes.STRING(300), allowNull: false },
      caption: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '' },
    },
    { sequelize, tableName: 'photos', underscored: true, timestamps: false },
  );
  Rating.init({ id, stars: { type: DataTypes.INTEGER, allowNull: false } }, { sequelize, tableName: 'ratings', underscored: true, timestamps: false });
  Favorite.init({ id }, { sequelize, tableName: 'favorites', underscored: true, timestamps: false, indexes: [{ unique: true, fields: ['recipe_id'] }] });

  // What belongs to a recipe goes away with it.
  const owned = { foreignKey: { name: 'recipeId', allowNull: false }, onDelete: 'CASCADE' } as const;
  Recipe.hasMany(Ingredient, { ...owned, as: 'ingredients' });
  Recipe.hasMany(Step, { ...owned, as: 'steps' });
  Recipe.hasOne(Photo, { ...owned, as: 'photo' });
  Recipe.hasMany(Rating, owned);
  Recipe.hasMany(Favorite, owned);
}
