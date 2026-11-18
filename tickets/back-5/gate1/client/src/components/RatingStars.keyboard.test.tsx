import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RatingStars } from './RatingStars.tsx';

const NAMES = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];

/** The control of a star: a button, or a radio button of a group of five. */
function star(name: string): HTMLElement {
  return screen.queryByRole('radio', { name }) ?? screen.getByRole('button', { name });
}

describe('the rating stars with the keyboard', () => {
  it('has a control with a name for each star', () => {
    render(<RatingStars onRate={() => {}} />);

    expect(NAMES.map((name) => star(name).tagName)).toHaveLength(5);
  });

  it('is reached with Tab', async () => {
    render(<RatingStars onRate={() => {}} />);

    await userEvent.tab();

    expect(NAMES.map(star)).toContain(document.activeElement);
  });

  it.each([
    ['2 stars', 2],
    ['5 stars', 5],
  ])('gives %s with Space on that star', async (name, stars) => {
    const onRate = vi.fn();
    render(<RatingStars onRate={onRate} />);

    star(name).focus();
    expect(document.activeElement).toBe(star(name));
    await userEvent.keyboard(' ');

    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith(stars);
  });

  it('still gives the stars of a click', async () => {
    const onRate = vi.fn();
    render(<RatingStars onRate={onRate} />);

    await userEvent.click(star('4 stars'));

    expect(onRate).toHaveBeenCalledWith(4);
  });

  it('gives nothing while it is disabled', async () => {
    const onRate = vi.fn();
    render(<RatingStars disabled onRate={onRate} />);

    expect(star('3 stars')).toBeDisabled();
    await userEvent.click(star('3 stars'));

    expect(onRate).not.toHaveBeenCalled();
  });
});
