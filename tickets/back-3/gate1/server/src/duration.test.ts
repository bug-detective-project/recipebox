import { describe, expect, it } from 'vitest';
import { parsePrepTime } from './duration.ts';

describe('parsePrepTime', () => {
  it.each([
    ['45', 45],
    ['45min', 45],
    ['45 min', 45],
    ['1h', 60],
    ['1h30', 90],
    ['1h 30min', 90],
    ['2H15', 135],
    ['  20 min ', 20],
  ])('reads %j as %i minutes', (text, minutes) => {
    expect(parsePrepTime(text)).toBe(minutes);
  });

  it.each(['', 'soon', 'h30', '1h90', '0', '0h', '1.5h', '90 minutes of love', '-10'])('refuses %j', (text) => {
    expect(parsePrepTime(text)).toBeUndefined();
  });

  it('refuses more than a day', () => {
    expect(parsePrepTime('24h')).toBe(1440);
    expect(parsePrepTime('24h1')).toBeUndefined();
  });
});
