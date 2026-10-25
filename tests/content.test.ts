import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import type { Rig } from "../src/content/bay/art";
import rigs from "../src/content/bay/puppets.json";
import { castPool, drawPool } from "../src/domain/tide/sea";
import { hasString } from "../src/i18n/t";

const lootIds = new Set(bay.loot.map((l) => l.id));
const WATERS = ["rio", "lago", "mar", "profundo"] as const;

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

  it("every puppet rig belongs to a creature of the Mazo, its joints hanging from a still body", () => {
    const creatureIds = new Set(bay.creatures.map((c) => c.id));
    for (const [id, { pieces }] of Object.entries(rigs as unknown as Record<string, Rig>)) {
      expect(creatureIds.has(id), id).toBe(true);
      const moving = new Set(pieces.filter((p) => p.pivot && p.sway && p.beat && p.h).map((p) => p.id));
      expect(
        pieces.filter((p) => p.pivot && !moving.has(p.id)),
        id,
      ).toEqual([]);
      expect(
        pieces.flatMap((p) => p.follows ?? []).filter((j) => !moving.has(j)),
        id,
      ).toEqual([]);
      expect(
        pieces.some((p) => !p.pivot && !p.follows && !p.id.startsWith("solape")),
        id,
      ).toBe(true);
    }
  });

  it("a Carta does not bite twice in a Marea until every one that fits has bitten", () => {
    const pool = castPool(bay, "lago", 1).map((c) => c.id);
    const drawn: string[] = [];
    for (const _ of pool) {
      const next = drawPool(bay, "lago", 1, drawn).map((c) => c.id);
      expect(next.some((id) => drawn.includes(id))).toBe(false);
      drawn.push(next[0] as string);
    }
    expect(drawPool(bay, "lago", 1, drawn).map((c) => c.id)).toEqual(pool);
  });

  it("a cast never comes up empty, at any depth of any water", () => {
    for (const water of WATERS) {
      for (let depth = 1; depth <= bay.maxDepth[water]; depth++) {
        expect(castPool(bay, water, depth).length, `${water} ${depth}`).toBeGreaterThan(0);
      }
    }
  });

  it("the shallow waters offer at least three different Cartas from the first cast", () => {
    for (const water of ["rio", "lago", "mar"] as const) {
      expect(castPool(bay, water, 1).length, water).toBeGreaterThanOrEqual(3);
    }
  });

  it("going deeper never takes a Carta away", () => {
    for (const water of WATERS) {
      for (let depth = 1; depth < bay.maxDepth[water]; depth++) {
        const above = castPool(bay, water, depth).map((c) => c.id);
        const below = castPool(bay, water, depth + 1).map((c) => c.id);
        expect(below, `${water} ${depth}→${depth + 1}`).toEqual(expect.arrayContaining(above));
      }
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
