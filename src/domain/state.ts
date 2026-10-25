import type { EventId, GearPiece, IslandId, RoomKind, Shadow, WaterType, WreckId } from "./content";

export const SAVE_VERSION = 3;
export const MAX_SCARS = 3;
export const BASE_SANITY = 6;
export const ROOMS_PER_SANITY = 3;
/** At or under this Cordura, Errantes can find you as you sail; carrying the Luz raises it. */
export const WANDERER_SANITY = 3;
export const WANDERER_SANITY_LIT = 5;
export const CASTS_PER_ROOM = 3;
export const HOLD_SIZE = 6;

export type Mutation = "ojos" | "brazo";
export type TideEnd = "dock" | "sunk" | "transformed";
export type Phase = "map" | "room" | "bite" | "fight" | "loot" | "farolero" | "end";
export type SanityCause = "time" | "descent" | "events" | "farolero" | "abyss" | "bestiary";

/** A message for the player: a locale key, never text. */
export interface Note {
  key: string;
  params?: Record<string, string | number>;
  bad?: boolean;
}

export interface Room {
  kind: RoomKind;
  water: WaterType;
  resolved: boolean;
  casts: number;
  content: WreckId | IslandId | EventId | null;
}

export interface Roll {
  dice: number[];
  total: number;
  target: number;
}

export interface Fight {
  creature: string;
  wanderer: boolean;
  damage: number;
  line: number;
  knots: number;
  bonus: number;
  sees: boolean;
  roll: Roll | null;
  /** True while the last roll missed and bleeding could still turn it into a hit. */
  bleedable: boolean;
  bled: boolean;
  last: Note | null;
}

export interface Tide {
  number: number;
  startedAt: number;
  phase: Phase;
  hp: number;
  sanity: number;
  ceiling: number;
  turn: number;
  rolls: number;
  sanityLost: number;
  causes: Partial<Record<SanityCause, number>>;
  room: number;
  visited: number[];
  revealed: number[];
  rooms: Room[];
  depth: number;
  lastRoll: number[] | null;
  farolero: number | null;
  lead: number;
  light: boolean;
  hold: string[];
  /** Cartas that bit this Marea, so the next cast prefers another. */
  drawn: string[];
  mutations: Mutation[];
  bite: { creature: string; shadow: Shadow } | null;
  fight: Fight | null;
  loot: { creature: string; recorded: boolean } | null;
  encounter: { dice: number[]; escapes: boolean } | null;
  end: TideEnd | null;
}

export interface Campaign {
  number: number;
  tides: number;
  gear: Record<GearPiece, number>;
  requestsDone: string[];
  chapter: number;
  chapterLight: boolean;
  chapterPiece: boolean;
  scars: number;
  ending: null | "choose" | "faro" | "bajar";
  shelf: string[];
}

/** One line of the Registro de sesiones: what measures the bet. */
export interface SessionEntry {
  campaign: number;
  tide: number;
  chapter: number;
  end: "light" | "no-light" | "sunk" | "transformed";
  minutes: number;
  rooms: number;
  rolls: number;
  sanityLost: number;
  causes: Partial<Record<SanityCause, number>>;
  hold: number;
  scars: number;
}

export interface Game {
  version: number;
  rng: number;
  place: string;
  /** Survives across Campañas, as the glossary says. */
  bestiary: string[];
  /** Landed or faced at least once; recording in the bestiary is the costly second step. */
  caught: string[];
  sessions: SessionEntry[];
  campaign: Campaign;
  tide: Tide | null;
  notes: Note[];
}

export function newCampaign(number: number): Campaign {
  return {
    number,
    tides: 0,
    gear: { cana: 1, sedal: 1, farol: 1, motor: 1, casco: 1 },
    requestsDone: [],
    chapter: 0,
    chapterLight: false,
    chapterPiece: false,
    scars: 0,
    ending: null,
    shelf: [],
  };
}

export function newGame(seed: number, place: string): Game {
  return {
    version: SAVE_VERSION,
    rng: seed,
    place,
    bestiary: [],
    caught: [],
    sessions: [],
    campaign: newCampaign(1),
    tide: null,
    notes: [],
  };
}

export function activeTide(g: Game): Tide {
  if (!g.tide) throw new Error("no Marea in progress");
  return g.tide;
}

export const note = (g: Game, key: string, params?: Note["params"], bad = false): void => {
  g.notes.push(params ? { key, params, bad } : { key, bad });
};
