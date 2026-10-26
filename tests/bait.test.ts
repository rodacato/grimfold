import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { type Command, reduce } from "../src/domain/actions";
import { wantedLoot } from "../src/domain/derived";
import { type Game, newGame, type Room } from "../src/domain/state";

const send = (game: Game, command: Command): Game => reduce(game, { ...command, at: 0 }, bay);

/** At the Muelle on the second Capítulo, with one Botín nobody wants on the shelf. */
function atTheActa(): Game {
  const game = newGame(3, bay.id);
  game.campaign.chapter = 1;
  const asked = [...bay.requests.map((r) => r.wants), ...bay.chapters.flatMap((c) => c.wants)];
  const spare = bay.loot.find((l) => !asked.includes(l.id));
  game.campaign.shelf = [spare?.id as string];
  return game;
}

function castIn(game: Game, water: Room["water"]): Game {
  const tide = game.tide as NonNullable<Game["tide"]>;
  const i = tide.rooms.findIndex((_, n) => n !== bay.map.dock && n !== bay.map.lighthouse);
  tide.rooms[i] = { kind: "water", water, resolved: false, casts: 0, content: null };
  tide.room = i;
  tide.phase = "room";
  return send(game, { type: "cast" });
}

describe("a cebo", () => {
  it("spends the spare Botín and makes the baited Carta the first bite in its water", () => {
    let game = send(atTheActa(), { type: "setBait", creature: "cangrejo" });
    expect(game.campaign.shelf).toEqual([]);
    game = send(game, { type: "startTide" });
    expect(game.campaign.bait).toBeNull();

    game = castIn(game, "lago");
    expect(game.tide?.bite?.creature).not.toBe("cangrejo");
    expect(game.tide?.bait).toBe("cangrejo");

    game = castIn(game, "rio");
    expect(game.tide?.bite?.creature).toBe("cangrejo");
    expect(game.tide?.bait).toBeNull();
  });

  it("is refused for a Carta whose Botín nobody asked for, or with nothing spare to spend", () => {
    const unwanted = bay.creatures.find(
      (c) => c.water !== null && !wantedLoot(bay, atTheActa().campaign).includes(c.loot),
    );
    const refused = send(atTheActa(), { type: "setBait", creature: unwanted?.id as string });
    expect(refused.campaign.bait).toBeNull();
    expect(refused.campaign.shelf.length).toBe(1);

    const empty = atTheActa();
    empty.campaign.shelf = ["pinza"];
    expect(send(empty, { type: "setBait", creature: "raya" }).campaign.bait).toBeNull();
  });
});
