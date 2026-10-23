import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { hasString } from "../src/i18n/t";

const lootIds = new Set(bay.loot.map((l) => l.id));

describe("the bay's content holds together", () => {
  it("every loot a creature, request or chapter names exists", () => {
    const named = [
      ...bay.creatures.map((c) => c.loot),
      ...bay.requests.map((r) => r.wants),
      ...bay.chapters.flatMap((c) => c.wants),
      bay.wreckLoot,
      bay.abyssLoot,
    ];
    expect(named.filter((id) => !lootIds.has(id))).toEqual([]);
  });

  it("every water type has something that bites at depth 1, so a cast never comes up empty", () => {
    for (const water of ["rio", "lago", "mar", "profundo"] as const) {
      const deck = bay.creatures.filter((c) => c.water === water);
      expect(deck.length, water).toBeGreaterThan(0);
    }
  });

  it("the map's links go both ways", () => {
    bay.map.nodes.forEach((node, i) => {
      for (const v of node.links) expect(bay.map.nodes[v]?.links, `${i}→${v}`).toContain(i);
    });
  });

  it("every content id has its text in the locale", () => {
    const keys = [
      ...bay.creatures.flatMap((c) => [`creature.${c.id}`, `creature.${c.id}.diary`, `person.${c.diaryBy}`]),
      ...bay.loot.map((l) => `loot.${l.id}`),
      ...bay.requests.flatMap((r) => [`request.${r.id}`, `person.${r.by}`]),
      ...bay.chapters.flatMap((c) => [
        `chapter.${c.id}.title`,
        `chapter.${c.id}.says`,
        `chapter.${c.id}.reveals`,
      ]),
    ];
    expect(keys.filter((k) => !hasString(k))).toEqual([]);
  });
});
