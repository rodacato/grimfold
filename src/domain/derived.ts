import type { Creature, GearPiece, Loot, Place, Request } from "./content";
import { BASE_SANITY, type Campaign, type Game, type Mutation } from "./state";

export interface Ctx {
  g: Game;
  place: Place;
  /** When the action happened, in ms; the only clock the rules see. */
  at: number;
}

export const gearLevel = (c: Campaign, piece: GearPiece): number => c.gear[piece];
export const maxHp = (c: Campaign): number => (gearLevel(c, "casco") >= 3 ? 15 : 12);
export const sanityCeiling = (c: Campaign): number => BASE_SANITY - c.scars;
export const campaignMutations = (c: Campaign): Mutation[] =>
  (["ojos", "brazo"] as Mutation[]).slice(0, c.scars);

export function creature(place: Place, id: string): Creature {
  const found = place.creatures.find((c) => c.id === id);
  if (!found) throw new Error(`unknown creature ${id}`);
  return found;
}

export function loot(place: Place, id: string): Loot {
  const found = place.loot.find((l) => l.id === id);
  if (!found) throw new Error(`unknown loot ${id}`);
  return found;
}

export const known = (g: Game, creatureId: string): boolean => g.bestiary.includes(creatureId);

/** Requests the town is asking for now: the next level of a piece that is not yet done. */
export const activeRequests = (place: Place, c: Campaign): Request[] =>
  place.requests.filter((r) => !c.requestsDone.includes(r.id) && gearLevel(c, r.gear) === r.level - 1);

export const requestWanting = (place: Place, c: Campaign, lootId: string): Request | undefined =>
  activeRequests(place, c).find((r) => r.wants === lootId);

export function chapterReady(place: Place, c: Campaign): boolean {
  const chapter = place.chapters[c.chapter];
  if (!chapter) return false;
  return c.chapterLight && (chapter.wants.length === 0 || c.chapterPiece);
}

export const campaignLost = (c: Campaign): boolean => c.scars >= 3;
