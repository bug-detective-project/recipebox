import type { ReactNode } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import type { FieldPath } from 'react-hook-form';
import { Link } from 'react-router';
import { ApiError } from '../api/http.ts';
import { CATEGORIES, CATEGORY_LABELS } from '../api/types.ts';
import type { Category, RecipeDetail, RecipeInput } from '../api/types.ts';
import { formatPrepTime } from '../utils/prepTime.ts';
import { DurationPicker } from './DurationPicker.tsx';
import { Icon } from './Icon.tsx';

/** What the form holds: every field as the cook sees it. */
export interface RecipeFormValues {
  title: string;
  description: string;
  category: Category;
  servings: number;
  /** Picked as hours and minutes; the API gets it as text ("45 min", "1h30"). */
  prepMinutes: number;
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
  prepMinutes: 0,
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
  prepMinutes: recipe.prepMinutes,
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
    prepTime: formatPrepTime(values.prepMinutes),
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
  if (apiField === 'prepTime') {
    return 'prepMinutes';
  }
  if (/^steps\.\d+$/.test(apiField)) {
    return `${apiField}.text` as FieldPath<RecipeFormValues>;
  }
  return apiField === 'body' ? 'root' : (apiField as FieldPath<RecipeFormValues>);
}

const label = 'flex flex-col gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase';
const input = 'field text-base font-normal tracking-normal normal-case';
const fieldError = 'text-sm font-medium tracking-normal text-danger normal-case';
const columnTitle = 'text-xs font-semibold tracking-wide text-muted uppercase';

/** A part of the form, as a card with its title and a line about what goes in it. */
function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <fieldset className="card flex min-w-0 flex-col gap-4 p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div>
        <p aria-hidden="true" className="font-display text-xl font-bold">
          {title}
        </p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      {children}
    </fieldset>
  );
}

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
      <Section title="The basics" hint="What it is, who it feeds and how long it takes.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className={`${label} md:col-span-2`}>
            Title
            <input className={input} {...register('title', { required: 'Give the recipe a title', minLength: { value: 3, message: 'At least 3 characters' } })} />
            {errors.title && <span className={fieldError}>{errors.title.message}</span>}
          </label>
          <label className={`${label} md:col-span-2`}>
            Description
            <textarea className={input} rows={2} {...register('description')} />
            {errors.description && <span className={fieldError}>{errors.description.message}</span>}
          </label>
          <label className={label}>
            Category
            <select className={input} {...register('category')}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] gap-4">
            <label className={label}>
              Servings
              <input
                className={input}
                type="number"
                min="1"
                max="100"
                step="1"
                {...register('servings', { valueAsNumber: true, required: 'How many servings?', min: { value: 1, message: 'At least 1' }, max: { value: 100, message: 'At most 100' } })}
              />
              {errors.servings && <span className={fieldError}>{errors.servings.message}</span>}
            </label>
            <div role="group" aria-labelledby="prep-time-label" className={label}>
              <span id="prep-time-label">Preparation time</span>
              <Controller
                control={control}
                name="prepMinutes"
                rules={{ validate: (minutes) => minutes > 0 || 'How long does it take?' }}
                render={({ field }) => (
                  <DurationPicker value={field.value} onChange={field.onChange} invalid={errors.prepMinutes !== undefined} describedBy={errors.prepMinutes ? 'error-prep-time' : undefined} />
                )}
              />
              {errors.prepMinutes && (
                <span id="error-prep-time" className={fieldError}>
                  {errors.prepMinutes.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Photo" hint="Optional. Say what the photo shows: the search reads it, and so do screen readers.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className={label}>
            Photo address
            <input className={input} placeholder="/images/hummus.svg" {...register('photoUrl')} />
            {errors.photoUrl && <span className={fieldError}>{errors.photoUrl.message}</span>}
          </label>
          <label className={label}>
            What the photo shows
            <input className={input} {...register('photoCaption')} />
            {errors.photoCaption && <span className={fieldError}>{errors.photoCaption.message}</span>}
          </label>
        </div>
      </Section>

      <Section title="Ingredients" hint="One per row, with the quantity for the servings above.">
        {ingredients.fields.length > 0 && (
          <div aria-hidden="true" className="hidden grid-cols-[6rem_6rem_1fr_2.5rem] gap-2 sm:grid">
            <span className={columnTitle}>Quantity</span>
            <span className={columnTitle}>Unit</span>
            <span className={columnTitle}>Ingredient</span>
          </div>
        )}
        {ingredients.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[4.5rem_4.5rem_1fr_2.5rem] items-start gap-2 sm:grid-cols-[6rem_6rem_1fr_2.5rem]" data-testid="ingredient-row">
            <input
              className={`${input} min-w-0`}
              type="number"
              min="0"
              step="any"
              aria-label={`Quantity of ingredient ${index + 1}`}
              {...register(`ingredients.${index}.quantity`, { valueAsNumber: true, required: true, validate: (value) => value > 0 })}
            />
            <input className={`${input} min-w-0`} placeholder="g, cup…" aria-label={`Unit of ingredient ${index + 1}`} {...register(`ingredients.${index}.unit`)} />
            <input className={`${input} min-w-0`} placeholder="flour" aria-label={`Name of ingredient ${index + 1}`} {...register(`ingredients.${index}.name`, { validate: (value) => value.trim() !== '' })} />
            <button type="button" className="button-danger size-10 p-0" aria-label={`Remove ingredient ${index + 1}`} title="Remove" onClick={() => ingredients.remove(index)}>
              <Icon name="trash" />
            </button>
            {errors.ingredients?.[index] && <span className={`${fieldError} col-span-4`}>Write a quantity above zero and a name</span>}
          </div>
        ))}
        {errors.ingredients?.root && (
          <span role="alert" className={fieldError}>
            {errors.ingredients.root.message}
          </span>
        )}
        <button type="button" className="button self-start border-dashed" onClick={() => ingredients.append({ name: '', quantity: 1, unit: '' })}>
          <Icon name="plus" />
          Add ingredient
        </button>
      </Section>

      <Section title="Steps" hint="In the order they are done. One action per step reads best at the stove.">
        {steps.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[2.25rem_1fr_2.5rem] items-start gap-2" data-testid="step-row">
            <span aria-hidden="true" className="mt-1 flex size-9 items-center justify-center rounded-full bg-accent-soft font-display text-lg font-bold text-accent-strong">
              {index + 1}
            </span>
            <textarea className={`${input} min-w-0`} rows={2} aria-label={`Step ${index + 1}`} {...register(`steps.${index}.text`, { validate: (value) => value.trim() !== '' })} />
            <button type="button" className="button-danger size-10 p-0" aria-label={`Remove step ${index + 1}`} title="Remove" onClick={() => steps.remove(index)}>
              <Icon name="trash" />
            </button>
            {errors.steps?.[index] && <span className={`${fieldError} col-span-3`}>Write what to do in this step</span>}
          </div>
        ))}
        <button type="button" className="button self-start border-dashed" onClick={() => steps.append({ text: '' })}>
          <Icon name="plus" />
          Add step
        </button>
      </Section>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <button type="submit" className="button-primary px-5 py-2.5 text-base" disabled={isSubmitting}>
          Save recipe
        </button>
        <Link to={editing ? `/recipes/${editing.id}` : '/'} className="button">
          Cancel
        </Link>
        {errors.root && (
          <span role="alert" className="font-medium text-danger">
            {errors.root.message}
          </span>
        )}
      </div>
    </form>
  );
}
