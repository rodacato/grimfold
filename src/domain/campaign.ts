import {
  activeRequests,
  baitable,
  type Ctx,
  campaignLost,
  campaignMutations,
  chapterReady,
  maxHp,
  sanityCeiling,
  spareLoot,
} from "./derived";
import { activeTide, HOLD_SIZE, newCampaign, type SessionEntry, type TideEnd } from "./state";
import { createRooms } from "./tide/map";

export function canStartTide({ g, place }: Ctx): boolean {
  const c = g.campaign;
  return !g.tide && c.ending === null && !campaignLost(c) && !chapterReady(place, c);
}

export function startTide(ctx: Ctx): void {
  if (!canStartTide(ctx)) return;
  const { g, place, at } = ctx;
  const c = g.campaign;
  const ceiling = sanityCeiling(c) + c.solace;
  c.solace = 0;
  const bait = c.bait;
  c.bait = null;
  const hold = c.packed;
  c.packed = [];
  g.tide = {
    number: c.tides + 1,
    startedAt: at,
    phase: "map",
    hp: maxHp(c),
    sanity: ceiling,
    ceiling,
    turn: 0,
    rolls: 0,
    sanityLost: 0,
    causes: {},
    room: place.map.dock,
    visited: [place.map.dock],
    revealed: [],
    rooms: [],
    depth: 1,
    lastRoll: null,
    farolero: null,
    lead: 0,
    light: false,
    hold,
    drawn: [],
    bait,
    mutations: campaignMutations(c),
    bite: null,
    fight: null,
    loot: null,
    encounter: null,
    end: null,
  };
  g.tide.rooms = createRooms(ctx);
}

export function endTide({ g, at }: Ctx, how: TideEnd): void {
  const tide = activeTide(g);
  if (tide.end) return;
  const c = g.campaign;
  tide.end = how;
  tide.phase = "end";
  c.tides++;
  if (how === "transformed") c.scars++;
  if (how === "dock") {
    c.shelf.push(...tide.hold);
    if (tide.light) c.chapterLight = true;
  }
  const end: SessionEntry["end"] = how === "dock" ? (tide.light ? "light" : "no-light") : how;
  g.sessions.push({
    campaign: c.number,
    tide: tide.number,
    chapter: c.chapter + 1,
    end,
    minutes: Math.round((at - tide.startedAt) / 6000) / 10,
    rooms: tide.turn,
    rolls: tide.rolls,
    sanityLost: tide.sanityLost,
    causes: tide.causes,
    hold: tide.hold.length,
    scars: c.scars,
  });
}

export function backToDock({ g }: Ctx): void {
  if (g.tide?.end) g.tide = null;
}

export function deliverRequest({ g, place }: Ctx, requestId: string): void {
  const c = g.campaign;
  const request = activeRequests(place, c).find((r) => r.id === requestId);
  const index = request ? c.shelf.indexOf(request.wants) : -1;
  if (g.tide || !request || index < 0) return;
  c.shelf.splice(index, 1);
  c.requestsDone.push(request.id);
  c.gear[request.gear] = Math.max(c.gear[request.gear], request.level);
}

export function giveChapterPiece({ g, place }: Ctx): void {
  const c = g.campaign;
  const piece = place.chapters[c.chapter]?.wants.find((w) => c.shelf.includes(w));
  if (g.tide || !piece || c.chapterPiece) return;
  c.shelf.splice(c.shelf.indexOf(piece), 1);
  c.chapterPiece = true;
  c.solace = 1;
}

/** Spends a Botín nobody will ask for, so a Carta that drops one somebody did bites first next Marea. */
export function setBait({ g, place }: Ctx, creatureId: string): void {
  const c = g.campaign;
  const spare = spareLoot(place, c);
  if (g.tide || c.bait || spare < 0 || !baitable(place, c).some((cr) => cr.id === creatureId)) return;
  c.shelf.splice(spare, 1);
  c.bait = creatureId;
}

/** Moves a Botín between the Repisa and the Bodega the next Marea starts with. */
export function pack({ g }: Ctx, item: string, aboard: boolean): void {
  const c = g.campaign;
  const [from, to] = aboard ? [c.shelf, c.packed] : [c.packed, c.shelf];
  const index = from.indexOf(item);
  if (g.tide || index < 0 || (aboard && to.length >= HOLD_SIZE)) return;
  from.splice(index, 1);
  to.push(item);
}

export function nextChapter({ g, place }: Ctx): void {
  const c = g.campaign;
  if (!chapterReady(place, c) || g.tide) return;
  if (c.chapter < place.chapters.length - 1) {
    c.chapter++;
    c.chapterLight = false;
    c.chapterPiece = false;
  } else c.ending = "choose";
}

export function chooseEnding({ g }: Ctx, ending: "faro" | "bajar"): void {
  if (g.campaign.ending === "choose") g.campaign.ending = ending;
}

export function startNewCampaign({ g }: Ctx): void {
  const c = g.campaign;
  const over = campaignLost(c) || c.ending === "faro" || c.ending === "bajar";
  if (!over || g.tide) return;
  g.campaign = newCampaign(c.number + 1);
}
