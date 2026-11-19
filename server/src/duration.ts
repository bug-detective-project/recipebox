/**
 * How a cook writes a preparation time: "45", "45min", "45 min", "1h", "1h30", "1h 30min".
 * Hours and minutes are both optional, and one of them has to be there.
 */
const PREP_TIME = /^(?:(\d{1,2})\s*h)?\s*(?:(\d{1,3})\s*(?:min)?)?$/i;

export const MAX_PREP_MINUTES = 24 * 60;

/** The minutes a preparation time stands for, or undefined when the text is not a time. */
export function parsePrepTime(text: string): number | undefined {
  const match = PREP_TIME.exec(text.trim());
  if (!match || (match[1] === undefined && match[2] === undefined)) {
    return undefined;
  }
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  // After the hours come the minutes of that hour: "1h90" is a typo, not 150 minutes.
  if (match[1] !== undefined && minutes > 59) {
    return undefined;
  }
  const total = hours * 60 + minutes;
  return total >= 1 && total <= MAX_PREP_MINUTES ? total : undefined;
}
