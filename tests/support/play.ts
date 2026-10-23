import { reduce } from "../../src/domain/actions";
import type { Place } from "../../src/domain/content";
import { type Game, newGame } from "../../src/domain/state";
import { nextCommand } from "./bot";

export interface Played {
  game: Game;
  steps: number;
}

/** Plays one Campaña to its end, 15 seconds of game clock per action. */
export function playCampaign(
  seed: number,
  place: Place,
  ending: "faro" | "bajar" = "faro",
  maxSteps = 20000,
): Played {
  let game = newGame(seed, place.id);
  let steps = 0;
  for (; steps < maxSteps; steps++) {
    const command = nextCommand(game, place, ending);
    if (!command) break;
    game = reduce(game, { ...command, at: steps * 15_000 }, place);
  }
  return { game, steps };
}
