import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { playCampaign } from "./support/play";

const SEEDS = Array.from({ length: 40 }, (_, i) => 1000 + i);

describe("a Campaña played only through the reducer", () => {
  it("always ends, in a Final or in the third Marca, never in a stuck loop", () => {
    for (const seed of SEEDS) {
      const { game, steps } = playCampaign(seed, bay);
      const over = game.campaign.ending === "faro" || game.campaign.scars >= 3;
      expect(over, `seed ${seed} stuck after ${steps} steps`).toBe(true);
    }
  });

  it("reaches a Final on some seeds, through all three Capítulos", () => {
    const finals = SEEDS.map((seed) => playCampaign(seed, bay).game).filter(
      (g) => g.campaign.ending === "faro",
    );
    expect(finals.length).toBeGreaterThan(0);
    for (const g of finals) expect(g.campaign.chapter).toBe(bay.chapters.length - 1);
  });

  it("can reach either Final", () => {
    const seed = SEEDS.find((s) => playCampaign(s, bay).game.campaign.ending === "faro") as number;
    expect(playCampaign(seed, bay, "bajar").game.campaign.ending).toBe("bajar");
  });

  it("replays to the exact same game from the same seed and actions", () => {
    expect(playCampaign(7, bay).game).toEqual(playCampaign(7, bay).game);
  });

  it("logs one Registro line per Marea, with a duration", () => {
    const { game } = playCampaign(1001, bay);
    expect(game.sessions.length).toBe(game.campaign.tides);
    expect(game.sessions.every((s) => s.minutes >= 0 && s.rooms >= 1)).toBe(true);
  });
});
