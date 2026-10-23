import { endTide } from "../campaign";
import { type Ctx, maxHp } from "../derived";
import { activeTide, note, type SanityCause } from "../state";

/** Returns true when the change ended the Marea. */
export function changeHp(ctx: Ctx, amount: number, key?: string): boolean {
  const tide = activeTide(ctx.g);
  tide.hp = Math.max(0, Math.min(maxHp(ctx.g.campaign), tide.hp + amount));
  if (key) note(ctx.g, key, { n: Math.abs(amount) }, amount < 0);
  if (tide.hp > 0) return false;
  endTide(ctx, "sunk");
  return true;
}

/** Returns true when the loss transformed the Arponera and ended the Marea. */
export function loseSanity(ctx: Ctx, amount: number, cause: SanityCause, key?: string): boolean {
  const tide = activeTide(ctx.g);
  tide.sanity = Math.max(0, tide.sanity - amount);
  tide.sanityLost += amount;
  tide.causes[cause] = (tide.causes[cause] ?? 0) + amount;
  if (key) note(ctx.g, key, { n: amount }, true);
  if (tide.sanity <= 4 && !tide.mutations.includes("ojos")) {
    tide.mutations.push("ojos");
    note(ctx.g, "mutation.ojos");
  }
  if (tide.sanity <= 2 && !tide.mutations.includes("brazo")) {
    tide.mutations.push("brazo");
    note(ctx.g, "mutation.brazo");
  }
  if (tide.sanity > 0) return false;
  endTide(ctx, "transformed");
  return true;
}

export function gainSanity(ctx: Ctx, amount: number, key?: string): void {
  const tide = activeTide(ctx.g);
  tide.sanity = Math.min(tide.ceiling, tide.sanity + amount);
  if (key) note(ctx.g, key, { n: amount });
}
