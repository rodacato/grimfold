import type { Creature, Place } from "../domain/content";

export interface D66Row {
  d66: number;
  creature: Creature;
}

/** The Mazo as the paper table: one row per Carta, ordered by its d66. */
export const tideSheetRows = (place: Place): D66Row[] =>
  place.creatures.map((creature) => ({ d66: creature.d66, creature })).sort((a, b) => a.d66 - b.d66);

export const isD66 = (n: number): boolean => {
  const tens = Math.floor(n / 10);
  const units = n % 10;
  return tens >= 1 && tens <= 6 && units >= 1 && units <= 6;
};
