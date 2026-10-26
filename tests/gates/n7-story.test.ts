import { describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import { reduce } from "../../src/domain/actions";
import { newGame } from "../../src/domain/state";
import { t } from "../../src/i18n/t";
import { nextCommand } from "../support/bot";

const ENDINGS = ["faro", "bajar"] as const;

function play(seed: number, ending: (typeof ENDINGS)[number]) {
  let game = newGame(seed, bay.id);
  const chapters: number[] = [];
  for (let step = 0; step < 5000; step++) {
    const command = nextCommand(game, bay, ending);
    if (!command) break;
    if (command.type === "nextChapter") chapters.push(game.campaign.chapter);
    game = reduce(game, { ...command, at: step * 15_000 }, bay);
  }
  return { game, chapters };
}

describe("N7: the Historia does not repeat itself", () => {
  it("never says the same line twice across its Capítulos and Finales", () => {
    const lines = [
      ...bay.chapters.flatMap((c) => ["says", "reveals", "hint"].map((part) => t(`chapter.${c.id}.${part}`))),
      ...ENDINGS.flatMap((e) => [t(`ending.${e}.title`), t(`ending.${e}.text`)]),
    ];
    expect(lines.filter((line, i) => lines.indexOf(line) !== i)).toEqual([]);
  });

  it("reveals each Capítulo once and in order, and reaches both Finales", () => {
    for (const ending of ENDINGS) {
      let reached = 0;
      for (let seed = 1; seed <= 40; seed++) {
        const { game, chapters } = play(seed, ending);
        if (game.campaign.ending !== ending) continue;
        reached++;
        expect(chapters).toEqual(bay.chapters.map((_, i) => i));
      }
      expect(reached, ending).toBeGreaterThan(0);
    }
  }, 120_000);
});
