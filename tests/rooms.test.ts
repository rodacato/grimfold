import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { reduce } from "../src/domain/actions";
import { newGame, type Room } from "../src/domain/state";
import { nextCommand } from "./support/bot";

describe("every Sala you stand in has something in it", () => {
  it("never shows a wreck, island or event without content, even after a wanderer fight on arrival", () => {
    let wanderersOnArrival = 0;
    for (let seed = 1; seed <= 40; seed++) {
      let game = newGame(seed, bay.id);
      for (let step = 0; step < 3000; step++) {
        const command = nextCommand(game, bay);
        if (!command) break;
        game = reduce(game, { ...command, at: step * 15_000 }, bay);
        const tide = game.tide;
        if (!tide) continue;
        const room = tide.rooms[tide.room] as Room;
        if (command.type === "navigate" && tide.fight?.wanderer && room.kind !== "water")
          wanderersOnArrival++;
        if (tide.phase === "room" && ["wreck", "island", "event"].includes(room.kind))
          expect(room.content, `seed ${seed} step ${step}`).not.toBeNull();
      }
    }
    expect(wanderersOnArrival).toBeGreaterThan(0);
  });
});
