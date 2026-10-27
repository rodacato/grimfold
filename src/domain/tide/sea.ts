import { endTide } from "../campaign";
import type { Creature, Place, WaterType } from "../content";
import { type Ctx, gearLevel } from "../derived";
import { d6, pick, shuffle } from "../rng";
import {
  activeTide,
  CASTS_PER_ROOM,
  HOLD_SIZE,
  note,
  ROOMS_PER_SANITY,
  type Room,
  WANDERER_SANITY,
  WANDERER_SANITY_LIT,
} from "../state";
import { startFight } from "./fight";
import { blocked, distance, isNeighbor, stepToward, visible } from "./map";
import { changeHp, gainSanity, loseSanity } from "./vitals";

export const castsLeft = (room: Room): number => CASTS_PER_ROOM - room.casts;

/** Every action that spends time lets the Farolero move; true when he catches you. */
export function timePasses(ctx: Ctx): boolean {
  const tide = activeTide(ctx.g);
  const nodes = ctx.place.map.nodes;
  if (tide.farolero === null) return false;
  if (tide.lead > 0 && tide.farolero !== tide.room) {
    tide.lead--;
    note(ctx.g, tide.lead ? "farolero.leaving" : "farolero.inWater", { lead: tide.lead + 1 });
    return false;
  }
  const jump = d6(ctx.g) >= 4 ? 2 : 1;
  for (let i = 0; i < jump && tide.farolero !== tide.room; i++) {
    tide.farolero = stepToward(nodes, tide.farolero, tide.room);
  }
  if (tide.farolero === tide.room) {
    tide.phase = "farolero";
    tide.encounter = null;
    return true;
  }
  const n = distance(nodes, tide.farolero, tide.room);
  note(ctx.g, jump === 2 ? "farolero.speeds" : "farolero.at", { n }, true);
  return false;
}

export function navigate(ctx: Ctx, destination: number): void {
  const { g, place } = ctx;
  const tide = activeTide(g);
  const target = tide.rooms[destination];
  if (tide.phase !== "map" && tide.phase !== "room") return;
  if (!target || !isNeighbor(place.map.nodes, tide.room, destination) || blocked(g.campaign, target)) return;
  tide.room = destination;
  tide.depth = 1;
  tide.lastRoll = null;
  if (!tide.visited.includes(destination)) tide.visited.push(destination);
  assignContent(ctx, target);
  tide.turn++;
  if (destination === place.map.dock) {
    endTide(ctx, "dock");
    return;
  }
  if (tide.turn % ROOMS_PER_SANITY === 0 && loseSanity(ctx, 1, "time", "sanity.time")) return;
  if (g.campaign.chapter === place.chapters.length - 1 && tide.turn >= 3 && tide.farolero === null) {
    tide.farolero = place.map.lighthouse;
    note(g, "farolero.wakesAlone", undefined, true);
  }
  if (timePasses(ctx)) return;
  const threshold = tide.light ? WANDERER_SANITY_LIT : WANDERER_SANITY;
  if (tide.sanity <= threshold && d6(g) <= 2) {
    const wanderers = place.creatures.filter((c) => c.water === null);
    note(g, tide.light ? "wanderer.light" : "wanderer.found", undefined, true);
    startFight(ctx, pick(g, wanderers).id, true);
    return;
  }
  tide.phase = "room";
}

function assignContent({ g, place }: Ctx, room: Room): void {
  if (room.content !== null) return;
  if (room.kind === "wreck") room.content = gearLevel(g.campaign, "casco") >= 2 ? "bodega" : "cofre";
  if (room.kind === "island") room.content = pick(g, place.islands);
  if (room.kind === "event") room.content = pick(g, place.events);
}

export function openMap(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase === "room") tide.phase = "map";
}

export function stayHere(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase !== "map" || tide.room === ctx.place.map.dock) return;
  assignContent(ctx, tide.rooms[tide.room] as Room);
  tide.phase = "room";
}

export function descend(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  const room = tide.rooms[tide.room] as Room;
  if (tide.phase !== "room" || room.kind !== "water" || tide.depth >= ctx.place.maxDepth[room.water]) return;
  if (timePasses(ctx)) return;
  tide.depth++;
  const roll = d6(ctx.g);
  tide.lastRoll = [roll];
  if (roll <= tide.depth) loseSanity(ctx, 1, "descent", "sanity.descent");
  else note(ctx.g, "descent.clean", { roll });
}

/** The Hoja de marea's rule: reroll a Carta of another water or deeper than you; if none fits, the shallowest. */
export function castPool(place: Place, water: WaterType, depth: number): Creature[] {
  const deck = place.creatures.filter((c) => c.water === water);
  const fits = deck.filter((c) => c.depth <= depth);
  if (fits.length) return fits;
  const shallowest = Math.min(...deck.map((c) => c.depth));
  return deck.filter((c) => c.depth === shallowest);
}

/** No Carta bites twice in a Marea until every one that fits has bitten. */
export function drawPool(place: Place, water: WaterType, depth: number, drawn: string[]): Creature[] {
  const pool = castPool(place, water, depth);
  const fresh = pool.filter((c) => !drawn.includes(c.id));
  return fresh.length ? fresh : pool;
}

function drawCard({ g, place }: Ctx): Creature {
  const tide = activeTide(g);
  const water = (tide.rooms[tide.room] as Room).water;
  const baited = castPool(place, water, tide.depth).find((c) => c.id === tide.bait);
  if (baited) {
    tide.bait = null;
    note(g, "bait.bit");
  }
  const card = baited ?? pick(g, drawPool(place, water, tide.depth, tide.drawn));
  tide.drawn.push(card.id);
  return card;
}

export function cast(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  const room = tide.rooms[tide.room] as Room;
  if (tide.phase !== "room" || room.kind !== "water" || !castsLeft(room)) return;
  room.casts++;
  if (timePasses(ctx)) return;
  const bitten = drawCard(ctx);
  tide.bite = { creature: bitten.id, shadow: bitten.shadow };
  tide.phase = "bite";
}

export function pull(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase !== "bite" || !tide.bite) return;
  const id = tide.bite.creature;
  tide.bite = null;
  startFight(ctx, id, false);
}

export function revealRooms({ g, place }: Ctx, n: number): void {
  const tide = activeTide(g);
  const hidden = place.map.nodes.map((_, i) => i).filter((i) => !visible(place, g.campaign, tide, i));
  for (const i of shuffle(g, hidden).slice(0, n)) tide.revealed.push(i);
}

/** A wreck or an event: yes or no. */
export function decide(ctx: Ctx, yes: boolean): void {
  const { g, place } = ctx;
  const tide = activeTide(g);
  const room = tide.rooms[tide.room] as Room;
  if (tide.phase !== "room" || room.resolved || (room.kind !== "wreck" && room.kind !== "event")) return;
  room.resolved = true;
  switch (room.content) {
    case "cofre":
      if (!yes) break;
      g.campaign.gear.casco = Math.max(2, g.campaign.gear.casco);
      note(g, "wreck.cofre.hull");
      if (loseSanity(ctx, 1, "events", "wreck.cofre.stare")) return;
      break;
    case "bodega": {
      if (!yes) break;
      const roll = d6(g);
      tide.lastRoll = [roll];
      if (roll >= 5 && tide.hold.length >= HOLD_SIZE) note(g, "wreck.bodega.full", { roll });
      else if (roll >= 5) {
        tide.hold.push(place.wreckLoot);
        note(g, "wreck.bodega.found", { roll });
      } else if (roll === 1) {
        if (changeHp(ctx, -2, "wreck.bodega.trapped")) return;
      } else note(g, "wreck.bodega.nothing", { roll });
      break;
    }
    case "boya":
      if (yes) {
        revealRooms(ctx, 1);
        note(g, "event.boya.follow");
      } else if (loseSanity(ctx, 1, "events", "event.boya.ignore")) return;
      break;
    case "nombre":
      if (yes) {
        if (changeHp(ctx, -2, "event.nombre.answer")) return;
      } else if (loseSanity(ctx, 1, "events", "event.nombre.silent")) return;
      break;
    case "sal":
      if (yes) {
        if (changeHp(ctx, -1, "event.sal.endure")) return;
      } else {
        tide.turn++;
        note(g, "event.sal.wait");
        if (tide.turn % ROOMS_PER_SANITY === 0 && loseSanity(ctx, 1, "time", "sanity.time")) return;
      }
      break;
    case "sirena":
      if (tide.farolero === null) note(g, yes ? "event.sirena.asleep" : "event.sirena.deaf");
      else if (!yes) {
        if (loseSanity(ctx, 1, "events", "event.sirena.covered")) return;
      } else {
        tide.farolero = stepToward(place.map.nodes, tide.farolero, tide.room);
        note(g, "event.sirena.closer", undefined, true);
        if (tide.farolero === tide.room) {
          tide.phase = "farolero";
          return;
        }
      }
      break;
  }
  timePasses(ctx);
}

export function explore(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  const room = tide.rooms[tide.room] as Room;
  if (tide.phase !== "room" || room.kind !== "island" || room.resolved) return;
  room.resolved = true;
  if (room.content === "fogata") gainSanity(ctx, 1, "island.fogata");
  else {
    revealRooms(ctx, 2);
    note(ctx.g, "island.observatorio");
  }
  timePasses(ctx);
}
