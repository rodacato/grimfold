import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { reduce } from "../src/domain/actions";
import { sanityCeiling } from "../src/domain/derived";
import { newGame, WANDERER_SANITY, WANDERER_SANITY_LIT } from "../src/domain/state";
import { nextCommand } from "./support/bot";

describe("losing Cordura says what it costs", () => {
  it("warns about Errantes exactly when Cordura crosses into their range, and never otherwise", () => {
    let crossings = 0;
    for (let seed = 1; seed <= 30; seed++) {
      let game = newGame(seed, bay.id);
      for (let step = 0; step < 3000; step++) {
        const command = nextCommand(game, bay);
        if (!command) break;
        const before = game.tide;
        game = reduce(game, { ...command, at: step * 15_000 }, bay);
        const after = game.tide;
        const sameTide = before && after && before.number === after.number;
        const line = after?.light || before?.light ? WANDERER_SANITY_LIT : WANDERER_SANITY;
        const crossed = sameTide && before.sanity > line && after.sanity <= line && after.sanity > 0;
        const warned = game.notes.some((n) => n.key === "sanity.hunted");
        if (sameTide) expect(warned, `seed ${seed} step ${step}`).toBe(Boolean(crossed));
        if (crossed) crossings++;
      }
    }
    expect(crossings).toBeGreaterThan(0);
  });
});

describe("the light's keeper", () => {
  it("is seen once more each time the light is taken, and stays seen across Campañas", () => {
    for (let seed = 1; seed <= 10; seed++) {
      let game = newGame(seed, bay.id);
      let thefts = 0;
      for (let step = 0; step < 4000; step++) {
        const command = nextCommand(game, bay);
        if (!command) break;
        const before = game.tide?.light;
        game = reduce(game, { ...command, at: step * 15_000 }, bay);
        if (before === false && game.tide?.light) thefts++;
      }
      expect(thefts, `seed ${seed}`).toBeGreaterThan(0);
      expect(game.sightings, `seed ${seed}`).toBe(thefts);
      game = reduce(game, { type: "newCampaign", at: 0 }, bay);
      expect(game.campaign.number, `seed ${seed}`).toBe(2);
      expect(game.sightings, `seed ${seed}`).toBe(thefts);
    }
  });
});

describe("handing back a Capítulo's piece", () => {
  it("raises Cordura by one for the next Marea only", () => {
    let checked = 0;
    for (let seed = 1; seed <= 30; seed++) {
      let game = newGame(seed, bay.id);
      let pending: "bonus" | "base" | null = null;
      for (let step = 0; step < 3000; step++) {
        const command = nextCommand(game, bay);
        if (!command) break;
        game = reduce(game, { ...command, at: step * 15_000 }, bay);
        if (command.type === "giveChapterPiece") pending = "bonus";
        if (command.type !== "startTide" || !game.tide || !pending) continue;
        const base = sanityCeiling(game.campaign);
        expect(game.tide.sanity, `seed ${seed} step ${step}`).toBe(pending === "bonus" ? base + 1 : base);
        if (pending === "base") checked++;
        pending = pending === "bonus" ? "base" : null;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
