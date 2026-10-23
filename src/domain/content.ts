export type WaterType = "rio" | "lago" | "mar" | "profundo";
export type Shadow = "chica" | "mediana" | "enorme";
export type Rarity = 0 | 1 | 2 | 3;
export type GearPiece = "cana" | "sedal" | "farol" | "motor" | "casco";
export type ItemUse = "golpe" | "nudo" | "ojo" | "calma" | "huida";
export type RoomKind = "dock" | "water" | "wreck" | "island" | "event" | "lighthouse";
export type WreckId = "cofre" | "bodega";
export type IslandId = "fogata" | "observatorio";
export type EventId = "boya" | "nombre" | "sal" | "sirena";

export interface Creature {
  id: string;
  d66: number;
  /** null for a wanderer: it finds you instead of biting a line. */
  water: WaterType | null;
  depth: number;
  hp: number;
  shadow: Shadow;
  rarity: Rarity;
  loot: string;
  unfishable?: boolean;
  diaryBy: string;
}

export interface Loot {
  id: string;
  use: ItemUse | null;
  rarity: Rarity;
}

export interface Request {
  id: string;
  by: string;
  wants: string;
  gear: GearPiece;
  level: number;
}

export interface Chapter {
  id: string;
  by: string;
  /** Any one of these, brought home, completes the chapter's piece. Empty: only the Luz. */
  wants: string[];
}

export interface MapNode {
  x: number;
  y: number;
  links: number[];
}

export interface Place {
  id: string;
  creatures: Creature[];
  loot: Loot[];
  requests: Request[];
  chapters: Chapter[];
  maxDepth: Record<WaterType, number>;
  map: {
    nodes: MapNode[];
    dock: number;
    lighthouse: number;
    /** Per node, the water types it may roll; the dock and the lighthouse are fixed. */
    waters: WaterType[][];
    /** One of these nodes becomes mar profundo. */
    deepAt: number[];
    /** Shuffled over the nodes that are neither the dock nor the lighthouse. */
    rooms: RoomKind[];
  };
  wrecks: WreckId[];
  islands: IslandId[];
  events: EventId[];
  /** Found while diving a wreck. */
  wreckLoot: string;
  /** Brought up from the creature that cannot be fished. */
  abyssLoot: string;
}
