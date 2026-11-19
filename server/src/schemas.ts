// The shape of what the API accepts. Fastify checks every request against the schema of its route
// before the route runs, and answers 400 by itself when the request does not fit.
import { CATEGORIES } from './models.ts';

/** At least one character that is not a space. */
const NOT_BLANK = '\\S';

export const recipeBody = {
  type: 'object',
  required: ['title', 'category', 'servings', 'prepTime', 'ingredients', 'steps'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 3, maxLength: 120, pattern: NOT_BLANK },
    description: { type: 'string', maxLength: 500 },
    category: { type: 'string', enum: CATEGORIES },
    servings: { type: 'integer', minimum: 1, maximum: 100 },
    // What the text means is checked by parsePrepTime, the one place that knows the formats.
    prepTime: { type: 'string', maxLength: 20 },
    photo: {
      type: ['object', 'null'],
      required: ['url'],
      additionalProperties: false,
      properties: {
        url: { type: 'string', maxLength: 300, pattern: '^(/|https://)\\S+$' },
        caption: { type: 'string', maxLength: 200 },
      },
    },
    ingredients: {
      type: 'array',
      maxItems: 50,
      items: {
        type: 'object',
        required: ['name', 'quantity'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', maxLength: 80, pattern: NOT_BLANK },
          quantity: { type: 'number', exclusiveMinimum: 0, maximum: 100000 },
          unit: { type: 'string', maxLength: 20 },
        },
      },
    },
    steps: {
      type: 'array',
      maxItems: 50,
      items: { type: 'string', maxLength: 1000, pattern: NOT_BLANK },
    },
  },
} as const;

export const ratingBody = {
  type: 'object',
  required: ['stars'],
  additionalProperties: false,
  properties: {
    stars: { type: 'integer', minimum: 1, maximum: 5 },
  },
} as const;

export const listQuery = {
  type: 'object',
  properties: {
    q: { type: 'string', maxLength: 80 },
    category: { type: 'string', enum: CATEGORIES },
    ingredient: { type: 'string', maxLength: 80 },
    favorites: { type: 'boolean' },
  },
} as const;

interface SchemaProblem {
  instancePath: string;
  keyword: string;
  message?: string;
  params: Record<string, unknown>;
}

/** One message per field that did not fit, by the name of the field ("title", "ingredients.0.name"). */
export function fieldsOf(problems: SchemaProblem[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const problem of problems) {
    const missing = problem.keyword === 'required' ? String(problem.params.missingProperty) : undefined;
    const path = [...problem.instancePath.split('/').filter(Boolean), ...(missing ? [missing] : [])].join('.');
    fields[path || 'body'] ??= missing ? 'is required' : (problem.message ?? 'is not valid');
  }
  return fields;
}
