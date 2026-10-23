export interface Seeded {
  rng: number;
}

/** mulberry32: the state lives in the game, so replaying the same actions rolls the same dice. */
export function random(g: Seeded): number {
  g.rng = (g.rng + 0x6d2b79f5) | 0;
  let t = Math.imul(g.rng ^ (g.rng >>> 15), 1 | g.rng);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const d6 = (g: Seeded): number => 1 + Math.floor(random(g) * 6);

export function pick<T>(g: Seeded, list: readonly T[]): T {
  const item = list[Math.floor(random(g) * list.length)];
  if (item === undefined) throw new Error("pick from an empty list");
  return item;
}

export function shuffle<T>(g: Seeded, list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random(g) * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}
