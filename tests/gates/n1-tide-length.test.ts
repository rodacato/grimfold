import { describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import { reduce } from "../../src/domain/actions";
import { newGame } from "../../src/domain/state";
import { nextCommand } from "../support/bot";

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

describe("N1: a Marea fits in ten minutes", () => {
  it("takes a median of at most 40 taps, each a roll or a decision, over 1000 simulated Campañas", () => {
    const perTide: number[] = [];
    for (let seed = 1; seed <= 1000; seed++) {
      let game = newGame(seed, bay.id);
      let moves = 0;
      for (let step = 0; step < 5000; step++) {
        const command = nextCommand(game, bay);
        if (!command) break;
        if (command.type === "startTide") moves = 0;
        else if (game.tide && command.type !== "backToDock") moves++;
        game = reduce(game, { ...command, at: step * 15_000 }, bay);
        if (command.type === "backToDock") perTide.push(moves);
      }
    }
    expect(perTide.length).toBeGreaterThan(1000);
    expect(median(perTide)).toBeLessThanOrEqual(40);
  }, 120_000);
});
