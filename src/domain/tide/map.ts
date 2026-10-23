import type { MapNode, Place, RoomKind, WaterType } from "../content";
import { type Ctx, gearLevel } from "../derived";
import { pick, shuffle } from "../rng";
import type { Campaign, Room, Tide } from "../state";

export interface Routes {
  dist: Record<number, number>;
  previous: Record<number, number>;
}

export function routes(nodes: MapNode[], from: number): Routes {
  const dist: Record<number, number> = { [from]: 0 };
  const previous: Record<number, number> = {};
  const queue = [from];
  while (queue.length) {
    const n = queue.shift() as number;
    for (const v of nodes[n]?.links ?? []) {
      if (dist[v] === undefined) {
        dist[v] = (dist[n] ?? 0) + 1;
        previous[v] = n;
        queue.push(v);
      }
    }
  }
  return { dist, previous };
}

export const distance = (nodes: MapNode[], a: number, b: number): number =>
  routes(nodes, a).dist[b] ?? Number.POSITIVE_INFINITY;

export const stepToward = (nodes: MapNode[], from: number, to: number): number =>
  routes(nodes, to).previous[from] ?? from;

export function stepAway(nodes: MapNode[], from: number, away: number): number {
  const dist = routes(nodes, away).dist;
  const links = nodes[from]?.links ?? [];
  return links.reduce((best, v) => ((dist[v] ?? 0) > (dist[best] ?? 0) ? v : best), from);
}

export const isNeighbor = (nodes: MapNode[], a: number, b: number): boolean =>
  nodes[a]?.links.includes(b) ?? false;

export const blocked = (c: Campaign, room: Room): boolean =>
  room.water === "profundo" && gearLevel(c, "casco") < 2;

export function visible(place: Place, c: Campaign, tide: Tide, i: number): boolean {
  if (tide.visited.includes(i) || tide.revealed.includes(i)) return true;
  const radius = gearLevel(c, "farol") >= 3 ? 2 : 1;
  return tide.visited.some((v) => distance(place.map.nodes, v, i) <= radius);
}

export function createRooms({ g, place }: Ctx): Room[] {
  const { map } = place;
  const deep = pick(g, map.deepAt);
  const kinds = shuffle(g, map.rooms);
  let next = 0;
  return map.nodes.map((_, i): Room => {
    const choices = map.waters[i] ?? [];
    const water: WaterType = i === deep ? "profundo" : choices.length ? pick(g, choices) : "rio";
    if (i === map.dock) return room("dock", "rio", true);
    if (i === map.lighthouse) return room("lighthouse", "mar", false);
    return room(kinds[next++] ?? "water", water, false);
  });
}

const room = (kind: RoomKind, water: WaterType, resolved: boolean): Room => ({
  kind,
  water,
  resolved,
  casts: 0,
  content: null,
});
