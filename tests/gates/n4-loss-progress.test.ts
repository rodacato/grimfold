import { describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import { reduce } from "../../src/domain/actions";
import { type Game, newGame } from "../../src/domain/state";
import { nextCommand } from "../support/bot";

const gearSum = (g: Game) => Object.values(g.campaign.gear).reduce((a, b) => a + b, 0);

describe("N4: losing is never wasted time", () => {
  it("keeps what a lost Marea caught, never takes back Equipo, and carries the Bestiario past a lost Campaña", () => {
    let lostTides = 0;
    let lostCampaigns = 0;
    for (let seed = 1; seed <= 300; seed++) {
      let game = newGame(seed, bay.id);
      for (let step = 0; step < 5000; step++) {
        const command = nextCommand(game, bay);
        if (!command) {
          if (game.campaign.scars < 3) break;
          const lost = game;
          game = reduce(game, { type: "newCampaign", at: step * 15_000 }, bay);
          expect(game.campaign.number).toBe(lost.campaign.number + 1);
          expect(game.bestiary).toEqual(lost.bestiary);
          lostCampaigns++;
          break;
        }
        const before = game;
        game = reduce(game, { ...command, at: step * 15_000 }, bay);
        expect(gearSum(game), `seed ${seed}`).toBeGreaterThanOrEqual(gearSum(before));
        expect(game.bestiary, `seed ${seed}`).toEqual(expect.arrayContaining(before.bestiary));
        expect(game.caught, `seed ${seed}`).toEqual(expect.arrayContaining(before.caught));
        if (!before.tide?.end && game.tide?.end && game.tide.end !== "dock") lostTides++;
      }
    }
    expect(lostTides).toBeGreaterThan(0);
    expect(lostCampaigns).toBeGreaterThan(0);
  }, 120_000);
});
