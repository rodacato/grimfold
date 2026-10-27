import type { Command } from "../../src/domain/actions";
import type { Place } from "../../src/domain/content";
import { activeRequests, chapterReady, creature, known } from "../../src/domain/derived";
import type { Game, Room, Tide } from "../../src/domain/state";
import { blocked, routes } from "../../src/domain/tide/map";
import { castsLeft } from "../../src/domain/tide/sea";

/** Without the Luz, a plain player turns for home at this Cordura rather than risk a Marca. */
const RETREAT_AT = 2;

/** A plain player: chases the chapter, fishes for its piece, runs home with the Luz. */
export function nextCommand(g: Game, place: Place, ending: "faro" | "bajar" = "faro"): Command | null {
  const c = g.campaign;
  if (!g.tide) {
    if (c.ending === "faro" || c.ending === "bajar" || c.scars >= 3) return null;
    if (c.ending === "choose") return { type: "chooseEnding", ending };
    const ready = activeRequests(place, c).find((r) => c.shelf.includes(r.wants));
    if (ready) return { type: "deliverRequest", request: ready.id };
    const wants = place.chapters[c.chapter]?.wants ?? [];
    if (!c.chapterPiece && wants.some((w) => c.shelf.includes(w))) return { type: "giveChapterPiece" };
    if (chapterReady(place, c)) return { type: "nextChapter" };
    return { type: "startTide" };
  }
  return tideCommand(g, place);
}

function tideCommand(g: Game, place: Place): Command {
  const tide = g.tide as Tide;
  const room = tide.rooms[tide.room] as Room;
  switch (tide.phase) {
    case "end":
      return { type: "backToDock" };
    case "farolero":
      return tide.encounter ? { type: "afterEncounter" } : { type: "flee" };
    case "bite":
      return { type: "pull" };
    case "fight": {
      const fight = tide.fight;
      if (fight && creature(place, fight.creature).unfishable) {
        return { type: "endure", holdOn: tide.sanity >= 4 && needsPiece(g, place).includes("idolo") };
      }
      if (fight?.bleedable && tide.hp > 5) return { type: "bleed" };
      return { type: "roll" };
    }
    case "loot": {
      const id = tide.loot?.creature as string;
      if (!known(g, id) && tide.sanity > 3) return { type: "record" };
      return tide.hold.length < 6
        ? { type: "stow", choice: { to: "hold" } }
        : { type: "stow", choice: { to: "sea" } };
    }
    case "room":
      if (tide.room === place.map.lighthouse && !tide.light) return { type: "stealLight" };
      if (!room.resolved && (room.kind === "wreck" || room.kind === "event"))
        return { type: "decide", yes: true };
      if (!room.resolved && room.kind === "island") return { type: "explore" };
      return fishOrMove(g, place) ?? { type: "openMap" };
    case "map":
      return fishOrMove(g, place) ?? { type: "stayHere" };
  }
}

function needsPiece(g: Game, place: Place): string[] {
  const c = g.campaign;
  const wants = place.chapters[c.chapter]?.wants ?? [];
  const tide = g.tide as Tide;
  if (c.chapterPiece || wants.some((w) => c.shelf.includes(w) || tide.hold.includes(w))) return [];
  return wants;
}

function fishOrMove(g: Game, place: Place): Command | null {
  const tide = g.tide as Tide;
  const room = tide.rooms[tide.room] as Room;
  const wanted = needsPiece(g, place);
  const source = place.creatures.find((cr) => wanted.includes(cr.loot) && cr.water === room.water);
  const retreating = !tide.light && tide.sanity <= RETREAT_AT;
  if (!tide.light && !retreating && source && room.kind === "water" && castsLeft(room) > 0) {
    if (tide.phase === "map") return { type: "stayHere" };
    if (tide.depth < source.depth && tide.depth < place.maxDepth[room.water]) return { type: "descend" };
    return { type: "cast" };
  }
  const goal = tide.light || retreating ? place.map.dock : place.map.lighthouse;
  const next = nextStep(g, place, goal);
  return next === null ? null : { type: "navigate", room: next };
}

function nextStep(g: Game, place: Place, goal: number): number | null {
  const tide = g.tide as Tide;
  const open = place.map.nodes.map((node) => ({
    ...node,
    links: node.links.filter((v) => !blocked(g.campaign, tide.rooms[v] as Room) || v === goal),
  }));
  const back = routes(open, goal).previous;
  return back[tide.room] ?? null;
}
