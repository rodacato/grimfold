import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { reduce } from "../src/domain/actions";
import { newGame, WANDERER_SANITY } from "../src/domain/state";
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
        const crossed =
          sameTide && before.sanity > WANDERER_SANITY && after.sanity <= WANDERER_SANITY && after.sanity > 0;
        const warned = game.notes.some((n) => n.key === "sanity.hunted");
        if (sameTide) expect(warned, `seed ${seed} step ${step}`).toBe(Boolean(crossed));
        if (crossed) crossings++;
      }
    }
    expect(crossings).toBeGreaterThan(0);
  });
});
