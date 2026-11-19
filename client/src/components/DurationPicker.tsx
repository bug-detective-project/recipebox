const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 12 }, (_, step) => step * 5);

const select = 'field w-auto min-w-0 flex-1 text-base font-normal tracking-normal normal-case tabular-nums';
const unit = 'text-sm font-medium tracking-normal text-muted normal-case';

interface DurationPickerProps {
  /** In minutes. */
  value: number;
  onChange: (minutes: number) => void;
  invalid?: boolean;
  describedBy?: string;
}

/** A length of time picked as hours and minutes, such as the preparation time of a recipe. */
export function DurationPicker({ value, onChange, invalid = false, describedBy }: DurationPickerProps) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  // A time saved with other minutes (27, from the API) keeps them as a choice.
  const minuteChoices = MINUTES.includes(minutes) ? MINUTES : [...MINUTES, minutes].sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2">
      <select className={select} aria-label="Hours" aria-invalid={invalid} aria-describedby={describedBy} value={hours} onChange={(event) => onChange(Number(event.target.value) * 60 + minutes)}>
        {HOURS.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className={unit}>
        h
      </span>
      <select className={select} aria-label="Minutes" aria-invalid={invalid} aria-describedby={describedBy} value={minutes} onChange={(event) => onChange(hours * 60 + Number(event.target.value))}>
        {minuteChoices.map((minute) => (
          <option key={minute} value={minute}>
            {String(minute).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className={unit}>
        min
      </span>
    </div>
  );
}
