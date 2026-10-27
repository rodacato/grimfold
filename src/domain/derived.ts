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

/** 0 unseen, 1 a shadow, 2 a shadow with a lit lure, 3 the whole fish. */
/** How much of the Farolero has been seen: nothing before the first sighting, then one stage per Capítulo. */
export const faroleroStage = (g: Game): number => (g.sightings ? Math.min(g.campaign.chapter + 1, 3) : 0);

export const known = (g: Game, creatureId: string): boolean => g.bestiary.includes(creatureId);
export const caught = (g: Game, creatureId: string): boolean => g.caught.includes(creatureId);

/** Requests the town is asking for now: the next level of a piece that is not yet done. */
export const activeRequests = (place: Place, c: Campaign): Request[] =>
  place.requests.filter((r) => !c.requestsDone.includes(r.id) && gearLevel(c, r.gear) === r.level - 1);

export const requestWanting = (place: Place, c: Campaign, lootId: string): Request | undefined =>
  activeRequests(place, c).find((r) => r.wants === lootId);

/** What the town is asking for right now: the open Encargos and the Capítulo's piece. */
export function wantedLoot(place: Place, c: Campaign): string[] {
  const chapter = c.chapterPiece ? [] : (place.chapters[c.chapter]?.wants ?? []);
  return [...activeRequests(place, c).map((r) => r.wants), ...chapter];
}

/** The first Botín on the shelf no Encargo or Capítulo still to come asks for: the only kind a cebo may spend. */
export const spareLoot = (place: Place, c: Campaign): number => {
  const pending = [
    ...place.requests.filter((r) => !c.requestsDone.includes(r.id)).map((r) => r.wants),
    ...place.chapters.slice(c.chapterPiece ? c.chapter + 1 : c.chapter).flatMap((ch) => ch.wants),
  ];
  return c.shelf.findIndex((s) => !pending.includes(s));
};

/** Cartas a cebo can call: the fishable ones that drop something the town wants. */
export const baitable = (place: Place, c: Campaign): Creature[] =>
  place.creatures.filter(
    (cr) => cr.water !== null && !cr.unfishable && wantedLoot(place, c).includes(cr.loot),
  );

export function chapterReady(place: Place, c: Campaign): boolean {
  const chapter = place.chapters[c.chapter];
  if (!chapter) return false;
  return c.chapterLight && (chapter.wants.length === 0 || c.chapterPiece);
}

export const campaignLost = (c: Campaign): boolean => c.scars >= 3;
