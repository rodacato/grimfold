import { describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import { reduce } from "../../src/domain/actions";
import type { GearPiece } from "../../src/domain/content";
import { newGame } from "../../src/domain/state";
import { nextCommand } from "../support/bot";

const GEAR: GearPiece[] = ["cana", "sedal", "farol", "motor", "casco"];

function lightRate(chapter: number, runs: number): number {
  let light = 0;
  for (let seed = 1; seed <= runs; seed++) {
    let game = newGame(seed, bay.id);
    game.campaign.chapter = chapter;
    for (const piece of GEAR) game.campaign.gear[piece] = 3;
    game = reduce(game, { type: "startTide", at: 0 }, bay);
    for (let i = 0; i < 600 && game.tide && !game.tide.end; i++) {
      const command = nextCommand(game, bay);
      if (!command) break;
      game = reduce(game, { ...command, at: i }, bay);
    }
    if (game.tide?.end === "dock" && game.tide.light) light++;
  }
  return light / runs;
}

describe("N6: real challenge, no power creep", () => {
  it("brings the Luz home at most 85% of the time with every piece of Equipo at level 3, in every Capítulo", () => {
    for (const [i] of bay.chapters.entries())
      expect(lightRate(i, 1000), `Capítulo ${i + 1}`).toBeLessThanOrEqual(0.85);
  }, 300_000);
});
