import { endTide } from "../campaign";
import type { Creature } from "../content";
import { type Ctx, creature, gearLevel, known, loot } from "../derived";
import { d6 } from "../rng";
import { activeTide, type Fight, HOLD_SIZE, note } from "../state";
import { stepAway } from "./map";
import { changeHp, gainSanity, loseSanity } from "./vitals";

export function startFight(ctx: Ctx, creatureId: string, wanderer: boolean): void {
  const tide = activeTide(ctx.g);
  const knots = 3 + gearLevel(ctx.g.campaign, "sedal");
  tide.fight = {
    creature: creatureId,
    wanderer,
    damage: 0,
    line: knots,
    knots,
    bonus: 0,
    sees: false,
    roll: null,
    bleedable: false,
    bled: false,
    last: null,
  };
  tide.phase = "fight";
}

function activeFight(ctx: Ctx): Fight | null {
  const tide = activeTide(ctx.g);
  return tide.phase === "fight" ? tide.fight : null;
}

export const targetFor = (ctx: Ctx, c: Creature, fight: Fight): number =>
  5 + c.depth - (known(ctx.g, c.id) ? 1 : 0) - (gearLevel(ctx.g.campaign, "cana") - 1) - fight.bonus;

const extraDamage = (ctx: Ctx): number => (activeTide(ctx.g).mutations.includes("brazo") ? 1 : 0);

export function seesHp(ctx: Ctx, fight: Fight): boolean {
  const tide = activeTide(ctx.g);
  return (
    fight.sees ||
    known(ctx.g, fight.creature) ||
    tide.mutations.includes("ojos") ||
    gearLevel(ctx.g.campaign, "farol") >= 2 ||
    fight.line === 1
  );
}

export function roll(ctx: Ctx): void {
  const fight = activeFight(ctx);
  if (!fight) return;
  const c = creature(ctx.place, fight.creature);
  if (c.unfishable) return;
  activeTide(ctx.g).rolls++;
  const a = d6(ctx.g);
  const b = d6(ctx.g);
  const total = a + b;
  const target = targetFor(ctx, c, fight);
  fight.roll = { dice: [a, b], total, target };
  fight.bleedable = total < target;
  fight.bled = false;
  if (total >= target) hit(ctx, fight, a === 6 && b === 6 ? 3 : 2);
  else miss(ctx, fight, total <= 4);
}

function hit(ctx: Ctx, fight: Fight, base: number): void {
  const damage = base + extraDamage(ctx);
  fight.damage += damage;
  fight.last = { key: "fight.hit", params: { n: damage } };
  settle(ctx, fight);
}

function miss(ctx: Ctx, fight: Fight, jerk: boolean): void {
  fight.line--;
  fight.last = { key: jerk ? "fight.missJerk" : "fight.miss", bad: true };
  if (jerk && changeHp(ctx, -1)) return;
  settle(ctx, fight);
}

export function bleed(ctx: Ctx): void {
  const fight = activeFight(ctx);
  if (!fight?.bleedable || fight.bled) return;
  fight.bled = true;
  fight.bleedable = false;
  fight.line++;
  if (changeHp(ctx, -2)) return;
  hit(ctx, fight, 2);
}

function markCaught({ g }: Ctx, id: string): void {
  if (!g.caught.includes(id)) g.caught.push(id);
}

function settle(ctx: Ctx, fight: Fight): void {
  const tide = activeTide(ctx.g);
  if (fight.damage >= creature(ctx.place, fight.creature).hp) {
    markCaught(ctx, fight.creature);
    tide.loot = { creature: fight.creature, recorded: false };
    tide.fight = null;
    tide.phase = "loot";
  } else if (fight.line <= 0) {
    note(ctx.g, fight.wanderer ? "fight.wandererGone" : "fight.gone", undefined, true);
    tide.fight = null;
    tide.phase = "room";
  }
}

export function cut(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase === "bite") {
    tide.bite = null;
    tide.phase = "room";
    return;
  }
  const fight = activeFight(ctx);
  if (!fight) return;
  if (fight.wanderer && changeHp(ctx, -1, "fight.rowAway")) return;
  tide.fight = null;
  tide.phase = "room";
}

/** What cannot be fished: cut and lose 1 Cordura, or hold on, lose 2 and bring something up. */
export function endure(ctx: Ctx, holdOn: boolean): void {
  const fight = activeFight(ctx);
  if (!fight || !creature(ctx.place, fight.creature).unfishable) return;
  const tide = activeTide(ctx.g);
  markCaught(ctx, fight.creature);
  tide.fight = null;
  tide.phase = "room";
  if (!holdOn) {
    loseSanity(ctx, 1, "abyss", "abyss.cut");
    return;
  }
  if (loseSanity(ctx, 2, "abyss", "abyss.hold")) return;
  if (tide.hold.length < HOLD_SIZE) tide.hold.push(ctx.place.abyssLoot);
  note(ctx.g, "abyss.loot");
}

export function useItem(ctx: Ctx, index: number): void {
  const tide = activeTide(ctx.g);
  const id = tide.hold[index];
  if (id === undefined) return;
  const use = loot(ctx.place, id).use;
  const fight = activeFight(ctx);
  const consume = () => tide.hold.splice(index, 1);
  if (use === "golpe" && fight) {
    consume();
    fight.damage += 2;
    fight.last = { key: "item.golpe", params: { item: id } };
    settle(ctx, fight);
  } else if (use === "nudo" && fight) {
    consume();
    fight.line = Math.min(fight.knots + 1, fight.line + 1);
    fight.last = { key: "item.nudo", params: { item: id } };
  } else if (use === "ojo" && fight) {
    consume();
    fight.sees = true;
    fight.bonus++;
    fight.last = { key: "item.ojo", params: { item: id } };
  } else if (use === "calma") {
    consume();
    gainSanity(ctx, 1, "item.calma");
  } else if (use === "huida" && tide.farolero !== null) {
    consume();
    for (let i = 0; i < 2; i++) tide.farolero = stepAway(ctx.place.map.nodes, tide.farolero, tide.room);
    note(ctx.g, "item.huida");
    if (tide.phase === "farolero") {
      tide.encounter = null;
      tide.phase = "map";
    }
  }
}

/** Writing a creature down costs Cordura ceiling for this Marea and helps forever. */
export function record(ctx: Ctx): void {
  const tide = activeTide(ctx.g);
  if (tide.phase !== "loot" || !tide.loot || known(ctx.g, tide.loot.creature)) return;
  ctx.g.bestiary.push(tide.loot.creature);
  tide.loot.recorded = true;
  tide.ceiling--;
  if (tide.sanity > tide.ceiling) {
    tide.causes.bestiary = (tide.causes.bestiary ?? 0) + 1;
    tide.sanity = tide.ceiling;
  }
  note(ctx.g, "bestiary.recorded", undefined, true);
  if (tide.sanity === 0) endTide(ctx, "transformed");
}

export type Stow = { to: "hold" } | { to: "sea" } | { to: "swap"; drop: number };

export function stow(ctx: Ctx, choice: Stow): void {
  const tide = activeTide(ctx.g);
  if (tide.phase !== "loot" || !tide.loot) return;
  const item = creature(ctx.place, tide.loot.creature).loot;
  if (choice.to === "swap") tide.hold.splice(choice.drop, 1);
  if (choice.to !== "sea" && tide.hold.length < HOLD_SIZE) tide.hold.push(item);
  tide.loot = null;
  tide.phase = "room";
}
