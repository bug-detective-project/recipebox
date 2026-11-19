import { useState } from 'react';

/** The people who share this cookbook. There is no login: each one picks a name in the header. */
export const COOKS = ['Marta', 'Leo', 'Bianca'] as const;

const STORAGE_KEY = 'recipebox-cook';

/** The cook using the cookbook on this browser; the API gets the name with every request. */
export function currentCook(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return COOKS.find((cook) => cook === stored) ?? COOKS[0];
}

export function useCook(): { cook: string; choose: (cook: string) => void } {
  const [cook, setCook] = useState(currentCook);

  return {
    cook,
    choose: (name) => {
      localStorage.setItem(STORAGE_KEY, name);
      setCook(name);
    },
  };
}
