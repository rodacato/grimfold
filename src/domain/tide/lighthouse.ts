import { type Ctx, gearLevel } from "../derived";
import { d6 } from "../rng";
import { activeTide, note, type Room } from "../state";
import { stepAway } from "./map";
import { changeHp, loseSanity } from "./vitals";

export function stealLight(ctx: Ctx): void {
  const { g, place } = ctx;
  const tide = activeTide(g);
  if (tide.phase !== "room" || tide.room !== place.map.lighthouse || tide.light) return;
  tide.light = true;
  g.sightings++;
  (tide.rooms[place.map.lighthouse] as Room).resolved = true;
  tide.farolero = place.map.lighthouse;
  tide.lead = gearLevel(g.campaign, "motor") >= 2 ? 2 : 1;
  note(g, "light.stolen");
  if (loseSanity(ctx, 1, "farolero", "light.saw")) return;
  tide.phase = "map";
}

export const escapeTarget = (ctx: Ctx): number => (gearLevel(ctx.g.campaign, "motor") >= 3 ? 7 : 8);

export function flee(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase !== "farolero" || tide.encounter || tide.farolero === null) return;
  const a = d6(ctx.g);
  const b = d6(ctx.g);
  tide.rolls++;
  const escapes = a + b >= escapeTarget(ctx);
  tide.encounter = { dice: [a, b], escapes };
  if (escapes) {
    tide.farolero = stepAway(ctx.place.map.nodes, tide.farolero, tide.room);
    return;
  }
  if (changeHp(ctx, -3)) return;
  loseSanity(ctx, 1, "farolero");
}

export function afterEncounter(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase !== "farolero" || !tide.encounter) return;
  tide.encounter = null;
  tide.phase = "map";
}
