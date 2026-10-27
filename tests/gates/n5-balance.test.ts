import { describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import { reduce } from "../../src/domain/actions";
import { type Game, newGame } from "../../src/domain/state";
import { nextCommand } from "../support/bot";

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

function campaigns(n: number) {
  const tides = bay.chapters.map(() => ({ light: 0, all: 0 }));
  const lengths: number[] = [];
  for (let seed = 1; seed <= n; seed++) {
    let game = newGame(seed, bay.id);
    for (let step = 0; step < 5000; step++) {
      const command = nextCommand(game, bay);
      if (!command) break;
      game = reduce(game, { ...command, at: step * 15_000 }, bay);
    }
    for (const s of game.sessions) {
      const chapter = tides[s.chapter - 1];
      if (!chapter) continue;
      chapter.all++;
      if (s.end === "light") chapter.light++;
    }
    lengths.push(game.campaign.tides);
  }
  return { rates: tides.map((c) => c.light / c.all), median: median(lengths) };
}

/** Straight to the lighthouse and home, never fishing: Cordura lost to the sail alone. */
function straightRun(seed: number, scars: number): { end: string | null; caught: boolean } {
  let game: Game = newGame(seed, bay.id);
  game.campaign.scars = scars;
  game = reduce(game, { type: "startTide", at: 0 }, bay);
  let caught = false;
  for (let i = 0; i < 500 && game.tide && !game.tide.end; i++) {
    const command = nextCommand(game, bay);
    if (!command) break;
    const skip = command.type === "cast" || command.type === "descend" || command.type === "stayHere";
    game = reduce(game, { ...(skip ? { type: "openMap" } : command), at: i } as never, bay);
    if (game.tide?.phase === "farolero") caught = true;
  }
  return { end: game.tide?.end ?? null, caught };
}

describe("N5: balance is proven with numbers", () => {
  it("brings the Luz home 45–65% of the time in each Capítulo, over Campañas of 6–12 Mareas", () => {
    const { rates, median: length } = campaigns(1000);
    for (const [i, rate] of rates.entries()) {
      expect(rate, `Capítulo ${i + 1}`).toBeGreaterThanOrEqual(0.45);
      expect(rate, `Capítulo ${i + 1}`).toBeLessThanOrEqual(0.65);
    }
    expect(length).toBeGreaterThanOrEqual(6);
    expect(length).toBeLessThanOrEqual(12);
  }, 300_000);

  it("never transforms an Arponera with 2 Marcas that sails straight there and back unless he catches her", () => {
    const runs = Array.from({ length: 1000 }, (_, i) => straightRun(i + 1, 2));
    expect(runs.filter((r) => r.end === "transformed" && !r.caught)).toEqual([]);
    expect(runs.filter((r) => r.end === "dock").length).toBeGreaterThan(0);
  }, 300_000);
});
