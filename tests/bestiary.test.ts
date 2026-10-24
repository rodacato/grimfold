import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { type Command, reduce } from "../src/domain/actions";
import { type Game, newGame } from "../src/domain/state";
import { nextCommand } from "./support/bot";

const send = (game: Game, command: Command, at: number): Game => reduce(game, { ...command, at }, bay);

/** Plays with the bot until a Carta comes up, and returns that moment. */
function firstLoot(seed: number): Game {
  let game = newGame(seed, bay.id);
  for (let step = 0; step < 2000; step++) {
    if (game.tide?.phase === "loot") return game;
    const command = nextCommand(game, bay);
    if (!command) break;
    game = send(game, command, step * 15_000);
  }
  throw new Error(`seed ${seed} never landed anything`);
}

describe("what the bestiary remembers", () => {
  it("a landed Carta stays in the bestiary as caught, even thrown back unrecorded", () => {
    const landing = firstLoot(7);
    const id = landing.tide?.loot?.creature as string;
    const after = send(landing, { type: "stow", choice: { to: "sea" } }, 0);
    expect(after.caught).toContain(id);
    expect(after.bestiary).not.toContain(id);
  });

  it("recording costs Cordura and keeps it caught", () => {
    const landing = firstLoot(7);
    const id = landing.tide?.loot?.creature as string;
    const after = send(landing, { type: "record" }, 0);
    expect(after.bestiary).toContain(id);
    expect(after.caught).toContain(id);
    expect(after.tide?.ceiling).toBe((landing.tide?.ceiling ?? 0) - 1);
  });

  it("a Carta that only bit and was cut is not caught", () => {
    let game = newGame(7, bay.id);
    for (let step = 0; step < 2000 && game.tide?.phase !== "bite"; step++) {
      const command = nextCommand(game, bay);
      if (!command) break;
      game = send(game, command, step * 15_000);
    }
    const id = game.tide?.bite?.creature as string;
    const before = game.caught.includes(id);
    const after = send(game, { type: "cut" }, 0);
    expect(after.caught.includes(id)).toBe(before);
  });
});
