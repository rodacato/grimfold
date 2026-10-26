import { describe, expect, it } from "vitest";
import { createStore, type Save, type SaveStorage } from "../src/app/store";
import { bay } from "../src/content/bay";
import { SAVE_VERSION } from "../src/domain/state";
import { nextCommand } from "./support/bot";

function memory(initial?: Save, failFirst = false): SaveStorage & { saved: () => Save | undefined } {
  let saved = initial;
  let failing = failFirst;
  return {
    saved: () => saved,
    read: async () => saved,
    async write(save) {
      if (failing) {
        failing = false;
        throw new Error("quota");
      }
      saved = save;
    },
  };
}

const flushed = () => new Promise((resolve) => setTimeout(resolve, 0));

async function played(steps: number, storage: SaveStorage) {
  const store = await createStore(storage, bay, { seed: 7, now: () => 0 });
  for (let i = 0; i < steps; i++) {
    const command = nextCommand(store.getGame(), bay);
    if (command) store.dispatch(command);
  }
  await flushed();
  return store;
}

describe("saving", () => {
  it("keeps saving after one write fails", async () => {
    const storage = memory(undefined, true);
    await played(3, storage);
    expect(storage.saved()?.actions).toHaveLength(3);
  });

  it("carries the Bestiario and the Registro into a game under new rules", async () => {
    const storage = memory();
    const old = await played(200, storage);
    const { bestiary, sessions } = old.getGame();
    expect(bestiary.length).toBeGreaterThan(0);
    const stale = { ...(storage.saved() as Save), version: SAVE_VERSION - 1 };

    const store = await createStore(memory(stale), bay, { seed: 7 });
    expect(store.getGame().campaign.tides).toBe(0);
    expect(store.getGame().bestiary).toEqual(bestiary);
    expect(store.getGame().sessions).toEqual(sessions);
  });

  it("starts a new game instead of a blank screen when the save cannot be replayed, keeping the Bestiario", async () => {
    const storage = memory();
    const old = await played(200, storage);
    const broken = { ...(storage.saved() as Save), actions: null } as unknown as Save;

    const store = await createStore(memory(broken), bay, { seed: 7 });
    expect(store.getGame().bestiary).toEqual(old.getGame().bestiary);
  });

  it("starts over on request, keeping the Bestiario", async () => {
    const store = await played(200, memory());
    const { bestiary } = store.getGame();
    store.reset();
    expect(store.getGame().campaign.tides).toBe(0);
    expect(store.getGame().bestiary).toEqual(bestiary);
  });
});
