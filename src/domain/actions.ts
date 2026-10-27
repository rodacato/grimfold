import {
  backToDock,
  chooseEnding,
  deliverRequest,
  giveChapterPiece,
  nextChapter,
  pack,
  setBait,
  startNewCampaign,
  startTide,
} from "./campaign";
import type { Place } from "./content";
import type { Ctx } from "./derived";
import type { Game } from "./state";
import { bleed, cut, endure, record, roll, type Stow, stow, useItem } from "./tide/fight";
import { afterEncounter, flee, stealLight } from "./tide/lighthouse";
import { cast, decide, descend, explore, navigate, openMap, pull, stayHere } from "./tide/sea";

export type Command =
  | { type: "startTide" }
  | { type: "navigate"; room: number }
  | { type: "openMap" }
  | { type: "stayHere" }
  | { type: "descend" }
  | { type: "cast" }
  | { type: "pull" }
  | { type: "cut" }
  | { type: "roll" }
  | { type: "bleed" }
  | { type: "endure"; holdOn: boolean }
  | { type: "useItem"; index: number }
  | { type: "record" }
  | { type: "stow"; choice: Stow }
  | { type: "decide"; yes: boolean }
  | { type: "explore" }
  | { type: "stealLight" }
  | { type: "flee" }
  | { type: "afterEncounter" }
  | { type: "backToDock" }
  | { type: "deliverRequest"; request: string }
  | { type: "giveChapterPiece" }
  | { type: "setBait"; creature: string }
  | { type: "pack"; item: string; aboard: boolean }
  | { type: "nextChapter" }
  | { type: "chooseEnding"; ending: "faro" | "bajar" }
  | { type: "newCampaign" };

/** A command plus the moment it happened: what gets saved and replayed. */
export type Action = Command & { at: number };

type Handlers = { [T in Command["type"]]: (ctx: Ctx, command: Extract<Command, { type: T }>) => void };

const handlers: Handlers = {
  startTide: (ctx) => startTide(ctx),
  navigate: (ctx, c) => navigate(ctx, c.room),
  openMap: (ctx) => openMap(ctx),
  stayHere: (ctx) => stayHere(ctx),
  descend: (ctx) => descend(ctx),
  cast: (ctx) => cast(ctx),
  pull: (ctx) => pull(ctx),
  cut: (ctx) => cut(ctx),
  roll: (ctx) => roll(ctx),
  bleed: (ctx) => bleed(ctx),
  endure: (ctx, c) => endure(ctx, c.holdOn),
  useItem: (ctx, c) => useItem(ctx, c.index),
  record: (ctx) => record(ctx),
  stow: (ctx, c) => stow(ctx, c.choice),
  decide: (ctx, c) => decide(ctx, c.yes),
  explore: (ctx) => explore(ctx),
  stealLight: (ctx) => stealLight(ctx),
  flee: (ctx) => flee(ctx),
  afterEncounter: (ctx) => afterEncounter(ctx),
  backToDock: (ctx) => backToDock(ctx),
  deliverRequest: (ctx, c) => deliverRequest(ctx, c.request),
  giveChapterPiece: (ctx) => giveChapterPiece(ctx),
  setBait: (ctx, c) => setBait(ctx, c.creature),
  pack: (ctx, c) => pack(ctx, c.item, c.aboard),
  nextChapter: (ctx) => nextChapter(ctx),
  chooseEnding: (ctx, c) => chooseEnding(ctx, c.ending),
  newCampaign: (ctx) => startNewCampaign(ctx),
};

export function reduce(game: Game, action: Action, place: Place): Game {
  const handle = handlers[action.type] as ((ctx: Ctx, command: Command) => void) | undefined;
  if (!handle) return game;
  const g = structuredClone(game);
  g.notes = [];
  handle({ g, place, at: action.at }, action);
  return g;
}
