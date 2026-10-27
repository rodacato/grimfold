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
      ...Object.values(bayArt.event),
      bayArt.chart,
      bayArt.lighthouse,
      bayArt.lamp,
      ...Object.values(bayArt.ending),
      bayArt.boat,
      bayArt.arponeraFromSea,
    ];
    expect(scenes.filter((p) => !shipped(p))).toEqual([]);
  });

  it("a portrait for everyone who asks for a Capítulo", () => {
    const portraits = bay.chapters.map((c) => bayArt.person(c.by));
    expect(portraits.filter((p) => !shipped(p))).toEqual([]);
  });

  it("every Botín, and every Equipo piece at each level", () => {
    const loot = bay.loot.map((l) => bayArt.loot(l.id));
    const gear = (["cana", "sedal", "farol", "motor", "casco"] as const).flatMap((g) =>
      [1, 2, 3].map((level) => bayArt.gear(g, level)),
    );
    expect([...loot, ...gear].filter((p) => !shipped(p))).toEqual([]);
  });

  it("a card back for every Sombra, and every piece of the Farolero's poses and the learned puppets", () => {
    const backs = (["chica", "mediana", "enorme"] as const).map(bayArt.cardBack);
    const rigs = ["farolero", "farolero-guardian", "farolero-persigue", ...Object.values(bayArt.learned)];
    const pieces = rigs.flatMap((id) => {
      const rig = bayArt.puppet(id);
      return rig ? rig.pieces.map((p) => `horrors/${id}/${p.file}`) : [`horrors/${id}: no puppet`];
    });
    expect([...backs, ...pieces].filter((p) => !shipped(p))).toEqual([]);
  });

  it("every creature's still, and every piece of its puppet", () => {
    const missing = bay.creatures.flatMap((c) => {
      const pieces = bayArt.puppet(c.id)?.pieces.map((p) => `horrors/${c.id}/${p.file}`) ?? [];
      return [bayArt.creature(c.id), ...pieces].filter((p) => !shipped(p));
    });
    expect(missing).toEqual([]);
  });
});
