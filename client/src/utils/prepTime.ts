/** Minutes as a cook writes them: 45 is "45 min", 90 is "1h30", 120 is "2h". */
export function formatPrepTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)}h${rest === 0 ? '' : String(rest).padStart(2, '0')}`;
}
