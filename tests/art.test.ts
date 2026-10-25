import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { bayArt } from "../src/content/bay/art";

const shipped = (path: string) => existsSync(`assets/web/${path}`);

describe("the art the game asks for is in assets/web", () => {
  it("every scene, the chart, the boat and the town", () => {
    const scenes = [
      ...bayArt.town,
      ...Object.values(bayArt.water),
      ...Object.values(bayArt.wreck),
      ...Object.values(bayArt.island),
      ...Object.values(bayArt.event).filter((p): p is string => p !== null),
      bayArt.chart,
      bayArt.lighthouse,
      bayArt.lamp,
      bayArt.boat,
      bayArt.arponeraFromSea,
    ];
    expect(scenes.filter((p) => !shipped(p))).toEqual([]);
  });

  it("every Botín, and every Equipo piece that has art at each level", () => {
    const loot = bay.loot.map((l) => bayArt.loot(l.id));
    const gear = (["cana", "sedal", "farol", "motor", "casco"] as const).flatMap((g) =>
      [1, 2, 3].map((level) => bayArt.gear(g, level)).filter((p): p is string => p !== null),
    );
    expect([...loot, ...gear].filter((p) => !shipped(p))).toEqual([]);
  });

  it("every creature's still, and every piece of its puppet", () => {
    const missing = bay.creatures.flatMap((c) => {
      const pieces = bayArt.puppet(c.id)?.pieces.map((p) => `horrors/${c.id}/${p.file}`) ?? [];
      return [bayArt.creature(c.id), ...pieces].filter((p) => !shipped(p));
    });
    expect(missing).toEqual([]);
  });
});
