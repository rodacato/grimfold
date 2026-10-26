import type { Creature, Place, WaterType } from "../domain/content";

const WATERS: WaterType[] = ["rio", "lago", "mar", "profundo"];

export interface D66Row {
  d66: number;
  creature: Creature;
}

/** The Mazo as the paper table: one row per Carta, ordered by its d66. */
export const tideSheetRows = (place: Place): D66Row[] =>
  place.creatures.map((creature) => ({ d66: creature.d66, creature })).sort((a, b) => a.d66 - b.d66);

/** Each water's Cartas shallowest first, so the ones that fit a depth are always the first ones on the list. */
export const bitesByWater = (place: Place): [WaterType, Creature[]][] =>
  WATERS.map((water) => [
    water,
    place.creatures.filter((c) => c.water === water).sort((a, b) => a.depth - b.depth || a.d66 - b.d66),
  ]);

export const isD66 = (n: number): boolean => {
  const tens = Math.floor(n / 10);
  const units = n % 10;
  return tens >= 1 && tens <= 6 && units >= 1 && units <= 6;
};
