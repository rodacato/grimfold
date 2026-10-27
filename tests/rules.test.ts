import { describe, expect, it } from "vitest";
import { bay } from "../src/content/bay";
import { type Command, reduce } from "../src/domain/actions";
import { faroleroStage, spareLoot } from "../src/domain/derived";
import { type Game, HOLD_SIZE, newGame, type Tide } from "../src/domain/state";
import { startFight } from "../src/domain/tide/fight";
import { distance } from "../src/domain/tide/map";

const send = (game: Game, command: Command): Game => reduce(game, { ...command, at: 0 }, bay);
const tideOf = (game: Game) => game.tide as Tide;
const neighbors = (node: number) => (bay.map.nodes[node] as { links: number[] }).links;
const nextToDock = neighbors(bay.map.dock)[0] as number;
const withUse = (use: string) => bay.loot.find((l) => l.use === use)?.id as string;

function atSea(seed = 1, setup: (g: Game) => void = () => {}): Game {
  const game = newGame(seed, bay.id);
  game.campaign.gear.casco = 3;
  setup(game);
  return send(game, { type: "startTide" });
}

function fighting(creature: string, hold: string[] = []): Game {
  const game = atSea();
  tideOf(game).hold = hold;
  startFight({ g: game, place: bay, at: 0 }, creature, false);
  return game;
}

describe("sailing home", () => {
  it("reaches the Muelle before the fog takes its Cordura", () => {
    const game = atSea();
    const tide = tideOf(game);
    tide.room = nextToDock;
    tide.turn = 2;
    tide.sanity = 1;
    tide.light = true;
    tide.phase = "map";
    const home = send(game, { type: "navigate", room: bay.map.dock });
    expect(home.tide?.end).toBe("dock");
    expect(home.campaign.chapterLight).toBe(true);
    expect(home.campaign.scars).toBe(0);
  });
});

describe("the last Capítulo's Farolero", () => {
  it("still wakes when waiting out the salt skips past the third Sala", () => {
    const game = atSea(1, (g) => {
      g.campaign.chapter = bay.chapters.length - 1;
    });
    const tide = tideOf(game);
    const room = nextToDock;
    tide.rooms[room] = { kind: "event", water: "rio", resolved: false, casts: 0, content: "sal" };
    tide.room = room;
    tide.turn = 2;
    tide.phase = "room";
    let next = send(game, { type: "decide", yes: false });
    expect(tideOf(next).turn).toBe(3);
    const onward = neighbors(room).find((n) => n !== bay.map.dock) as number;
    next = send(next, { type: "navigate", room: onward });
    expect(tideOf(next).farolero).not.toBeNull();
  });
});

describe("what cannot be fished", () => {
  it("is landed like any Carta when held on to, so a full Bodega can swap for it and it can be written down", () => {
    const full = Array.from({ length: HOLD_SIZE }, () => "red");
    let game = send(fighting("duerme", full), { type: "endure", holdOn: true });
    expect(tideOf(game).phase).toBe("loot");
    game = send(game, { type: "record" });
    expect(game.bestiary).toContain("duerme");
    game = send(game, { type: "stow", choice: { to: "swap", drop: 0 } });
    expect(tideOf(game).hold).toContain("idolo");
    expect(tideOf(game).hold).toHaveLength(HOLD_SIZE);
  });

  it("cannot be struck with a Botín or cut for free", () => {
    const game = fighting("duerme", ["pinza"]);
    for (const command of [{ type: "useItem", index: 0 }, { type: "cut" }] as Command[]) {
      const after = send(game, command);
      expect(tideOf(after).phase).toBe("fight");
      expect(tideOf(after).hold).toEqual(["pinza"]);
    }
  });
});

describe("the Bodega", () => {
  it("never loses a Botín to a swap that was not needed or that names no slot", () => {
    const landed = (hold: string[]) => {
      const game = atSea();
      Object.assign(tideOf(game), { hold, phase: "loot", loot: { creature: "cangrejo", recorded: false } });
      return game;
    };
    const roomy = send(landed(["red"]), { type: "stow", choice: { to: "swap", drop: 0 } });
    expect(tideOf(roomy).hold).toEqual(["red"]);
    const full = Array.from({ length: HOLD_SIZE }, () => "red");
    const nowhere = send(landed(full), { type: "stow", choice: { to: "swap", drop: 9 } });
    expect(tideOf(nowhere).phase).toBe("loot");
  });

  it("says the wreck's find did not fit when it is full", () => {
    let seen = false;
    for (let seed = 1; seed <= 40 && !seen; seed++) {
      const game = atSea(seed);
      const tide = tideOf(game);
      tide.rooms[tide.room] = { kind: "wreck", water: "rio", resolved: false, casts: 0, content: "bodega" };
      tide.hold = Array.from({ length: HOLD_SIZE }, () => "red");
      tide.phase = "room";
      const after = send(game, { type: "decide", yes: true });
      if (after.notes.some((n) => n.key === "wreck.bodega.full")) seen = true;
      expect(after.notes.some((n) => n.key === "wreck.bodega.found")).toBe(false);
      expect(tideOf(after).hold.every((id) => id === "red")).toBe(true);
    }
    expect(seen).toBe(true);
  });
});

describe("Botines in the Bodega", () => {
  it("are not spent when they would do nothing", () => {
    const calm = atSea();
    tideOf(calm).hold = [withUse("calma")];
    expect(tideOf(send(calm, { type: "useItem", index: 0 })).hold).toHaveLength(1);

    const knotted = fighting("cangrejo", [withUse("nudo")]);
    expect(tideOf(send(knotted, { type: "useItem", index: 0 })).hold).toHaveLength(1);
  });

  it("do nothing once the Marea has ended", () => {
    const game = atSea();
    Object.assign(tideOf(game), { hold: [withUse("calma")], sanity: 0, end: "transformed", phase: "end" });
    expect(tideOf(send(game, { type: "useItem", index: 0 })).sanity).toBe(0);
  });
});

describe("the bestiary", () => {
  it("cannot take the last point of Cordura", () => {
    const game = atSea();
    Object.assign(tideOf(game), {
      sanity: 1,
      ceiling: 1,
      phase: "loot",
      loot: { creature: "cangrejo", recorded: false },
    });
    const after = send(game, { type: "record" });
    expect(after.bestiary).not.toContain("cangrejo");
    expect(tideOf(after).end).toBeNull();
  });
});

describe("the town", () => {
  it("takes Encargos and Capítulo pieces only at the Muelle", () => {
    const game = atSea(1, (g) => {
      g.campaign.chapter = 1;
      g.campaign.shelf = ["mecha", "pinza"];
    });
    const after = send(send(game, { type: "deliverRequest", request: "e1" }), { type: "giveChapterPiece" });
    expect(after.campaign.shelf).toEqual(["mecha", "pinza"]);
    expect(after.campaign.chapterPiece).toBe(false);
  });

  it("never lets a cebo spend a Botín a later Capítulo will ask for", () => {
    const game = newGame(1, bay.id);
    game.campaign.shelf = ["corona"];
    expect(spareLoot(bay, game.campaign)).toBe(-1);
  });
});

function caughtWithLight(seed: number): Game {
  const game = atSea(seed);
  const tide = tideOf(game);
  tide.room = nextToDock;
  tide.light = true;
  tide.farolero = nextToDock;
  tide.phase = "farolero";
  return send(game, { type: "flee" });
}

describe("the Farolero catching you with the light", () => {
  it("takes it back to the tower when you fail to escape, where it can be stolen again", () => {
    const outcomes = Array.from({ length: 40 }, (_, i) => caughtWithLight(i + 1));
    const taken = outcomes.filter((g) => !tideOf(g).encounter?.escapes);
    const escaped = outcomes.filter((g) => tideOf(g).encounter?.escapes);
    expect(taken.length).toBeGreaterThan(0);
    expect(escaped.length).toBeGreaterThan(0);
    for (const g of taken) {
      expect(tideOf(g).light).toBe(false);
      expect(tideOf(g).farolero).toBeNull();
      expect(tideOf(g).rooms[bay.map.lighthouse]?.resolved).toBe(false);
    }
    for (const g of escaped) expect(tideOf(g).light).toBe(true);
  });
});

describe("the lighthouse's horn", () => {
  function hearing(yes: boolean): { before: Tide; after: Tide } {
    const game = atSea();
    const tide = tideOf(game);
    tide.rooms[nextToDock] = { kind: "event", water: "rio", resolved: false, casts: 0, content: "sirena" };
    tide.room = nextToDock;
    tide.phase = "room";
    tide.farolero = bay.map.lighthouse;
    const before = structuredClone(tide);
    return { before, after: tideOf(send(game, { type: "decide", yes })) };
  }

  it("trades distance for Cordura once he is awake", () => {
    const away = (tide: Tide) => distance(bay.map.nodes, tide.farolero as number, tide.room);
    const listened = hearing(true);
    const covered = hearing(false);
    expect(listened.after.sanity).toBe(listened.before.sanity);
    expect(covered.after.sanity).toBe(covered.before.sanity - 1);
    expect(away(listened.after)).toBe(away(covered.after) - 1);
  });
});

describe("the Farolero's face", () => {
  it("shows one more stage each Capítulo, and nothing before he is first seen", () => {
    const game = newGame(1, bay.id);
    expect(faroleroStage(game)).toBe(0);
    game.sightings = 1;
    expect(
      bay.chapters.map((_, i) => faroleroStage({ ...game, campaign: { ...game.campaign, chapter: i } })),
    ).toEqual([1, 2, 3]);
  });
});
