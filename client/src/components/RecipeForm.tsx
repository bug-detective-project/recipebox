import { useFieldArray, useForm } from 'react-hook-form';
import type { FieldPath } from 'react-hook-form';
import { ApiError } from '../api/http.ts';
import { CATEGORIES, CATEGORY_LABELS } from '../api/types.ts';
import type { Category, RecipeDetail, RecipeInput } from '../api/types.ts';
import { formatPrepTime } from '../utils/prepTime.ts';

/** What the form holds: every field as the cook sees it. */
export interface RecipeFormValues {
  title: string;
  description: string;
  category: Category;
  servings: number;
  prepTime: string;
  photoUrl: string;
  photoCaption: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: { text: string }[];
}

const NEW_RECIPE: RecipeFormValues = {
  title: '',
  description: '',
  category: 'main',
  servings: 4,
  prepTime: '',
  photoUrl: '',
  photoCaption: '',
  ingredients: [{ name: '', quantity: 1, unit: '' }],
  steps: [{ text: '' }],
};

const valuesOf = (recipe: RecipeDetail): RecipeFormValues => ({
  title: recipe.title,
  description: recipe.description,
  category: recipe.category,
  servings: recipe.servings,
  prepTime: formatPrepTime(recipe.prepMinutes),
  photoUrl: recipe.photo?.url ?? '',
  photoCaption: recipe.photo?.caption ?? '',
  ingredients: recipe.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit })),
  steps: recipe.steps.map(({ text }) => ({ text })),
});

/** What the API gets: the recipe exactly as the form shows it when the cook saves. */
function inputOf(values: RecipeFormValues): RecipeInput {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    servings: values.servings,
    prepTime: values.prepTime,
    photo: values.photoUrl.trim() === '' ? null : { url: values.photoUrl.trim(), caption: values.photoCaption },
    ingredients: values.ingredients,
    steps: values.steps.map((step) => step.text),
  };
}

/** The field of the form a field of the API stands for ("steps.0" is "steps.0.text" here). */
function formField(apiField: string): FieldPath<RecipeFormValues> | 'root' {
  if (apiField.startsWith('photo')) {
    return apiField.endsWith('caption') ? 'photoCaption' : 'photoUrl';
  }
  if (/^steps\.\d+$/.test(apiField)) {
    return `${apiField}.text` as FieldPath<RecipeFormValues>;
  }
  return apiField === 'body' ? 'root' : (apiField as FieldPath<RecipeFormValues>);
}

const label = 'flex flex-col gap-1 text-sm font-medium text-muted';
const fieldError = 'text-sm font-normal text-danger';

/**
 * The form of a recipe: a new one, or the changes to `editing`. `save` sends it to the API; what
 * the API refuses is shown next to the field it names.
 */
export function RecipeForm({ editing, save }: { editing?: RecipeDetail; save: (input: RecipeInput) => Promise<unknown> }) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({ defaultValues: editing ? valuesOf(editing) : NEW_RECIPE });
  const ingredients = useFieldArray({
    control,
    name: 'ingredients',
    // A rule of the whole list: its message is errors.ingredients.root.
    rules: { validate: (items) => items.length > 0 || 'Add at least one ingredient' },
  });
  const steps = useFieldArray({ control, name: 'steps' });

  const submit = handleSubmit(async (values) => {
    try {
      await save(inputOf(values));
    } catch (error) {
      const fields = error instanceof ApiError ? Object.entries(error.fields) : [];
      for (const [field, message] of fields) {
        setError(formField(field), { message });
      }
      if (fields.length === 0) {
        setError('root', { message: 'The recipe could not be saved.' });
      }
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void submit(event)} noValidate>
      <div className="grid gap-3 rounded-xl border border-border bg-surface-raised p-4 md:grid-cols-2">
        <label className={`${label} md:col-span-2`}>
          Title
          <input className="field" {...register('title', { required: 'Give the recipe a title', minLength: { value: 3, message: 'At least 3 characters' } })} />
          {errors.title && <span className={fieldError}>{errors.title.message}</span>}
        </label>
        <label className={`${label} md:col-span-2`}>
          Description
          <textarea className="field" rows={2} {...register('description')} />
          {errors.description && <span className={fieldError}>{errors.description.message}</span>}
        </label>
        <label className={label}>
          Category
          <select className="field" {...register('category')}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Servings
          <input
            className="field"
            type="number"
            min="1"
            max="100"
            step="1"
            {...register('servings', { valueAsNumber: true, required: 'How many servings?', min: { value: 1, message: 'At least 1' }, max: { value: 100, message: 'At most 100' } })}
          />
          {errors.servings && <span className={fieldError}>{errors.servings.message}</span>}
        </label>
        <label className={label}>
          Preparation time
          <input className="field" placeholder="45 min or 1h30" {...register('prepTime', { required: 'How long does it take?' })} />
          {errors.prepTime && <span className={fieldError}>{errors.prepTime.message}</span>}
        </label>
        <label className={label}>
          Photo address
          <input className="field" placeholder="/images/hummus.svg" {...register('photoUrl')} />
          {errors.photoUrl && <span className={fieldError}>{errors.photoUrl.message}</span>}
        </label>
        <label className={`${label} md:col-span-2`}>
          What the photo shows
          <input className="field" {...register('photoCaption')} />
          {errors.photoCaption && <span className={fieldError}>{errors.photoCaption.message}</span>}
        </label>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4">
        <legend className="px-1 text-lg font-semibold">Ingredients</legend>
        {ingredients.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[5rem_5rem_1fr_auto] items-start gap-2" data-testid="ingredient-row">
            <input
              className="field min-w-0"
              type="number"
              min="0"
              step="any"
              aria-label={`Quantity of ingredient ${index + 1}`}
              {...register(`ingredients.${index}.quantity`, { valueAsNumber: true, required: true, validate: (value) => value > 0 })}
            />
            <input className="field min-w-0" placeholder="g, cup…" aria-label={`Unit of ingredient ${index + 1}`} {...register(`ingredients.${index}.unit`)} />
            <input className="field min-w-0" placeholder="flour" aria-label={`Name of ingredient ${index + 1}`} {...register(`ingredients.${index}.name`, { validate: (value) => value.trim() !== '' })} />
            <button type="button" className="button" aria-label={`Remove ingredient ${index + 1}`} onClick={() => ingredients.remove(index)}>
              Remove
            </button>
            {errors.ingredients?.[index] && <span className={`${fieldError} col-span-4`}>Write a quantity above zero and a name</span>}
          </div>
        ))}
        {errors.ingredients?.root && (
          <span role="alert" className={fieldError}>
            {errors.ingredients.root.message}
          </span>
        )}
        <button type="button" className="button self-start" onClick={() => ingredients.append({ name: '', quantity: 1, unit: '' })}>
          Add ingredient
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4">
        <legend className="px-1 text-lg font-semibold">Steps</legend>
        {steps.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-2" data-testid="step-row">
            <textarea className="field min-w-0" rows={2} aria-label={`Step ${index + 1}`} {...register(`steps.${index}.text`, { validate: (value) => value.trim() !== '' })} />
            <button type="button" className="button" aria-label={`Remove step ${index + 1}`} onClick={() => steps.remove(index)}>
              Remove
            </button>
            {errors.steps?.[index] && <span className={`${fieldError} col-span-2`}>Write what to do in this step</span>}
          </div>
        ))}
        <button type="button" className="button self-start" onClick={() => steps.append({ text: '' })}>
          Add step
        </button>
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          Save recipe
        </button>
        {errors.root && (
          <span role="alert" className="text-danger">
            {errors.root.message}
          </span>
        )}
      </div>
    </form>
  );
}
