import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { createStore } from "../../src/app/store";
import { bay } from "../../src/content/bay";
import { indexedDbStorage } from "../../src/infra/indexeddb";
import { nextCommand } from "../support/bot";

describe("N8: closing mid-Marea and reopening restores the exact state", () => {
  it("restores from IndexedDB what was on screen before closing", async () => {
    let clock = 0;
    const now = () => (clock += 15_000);
    const first = await createStore(indexedDbStorage(), bay, { seed: 42, now });
    for (let i = 0; i < 40; i++) {
      const command = nextCommand(first.getGame(), bay);
      if (command) first.dispatch(command);
    }
    const before = first.getGame();
    expect(before.tide, "the bot should be mid-Marea").not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const reopened = await createStore(indexedDbStorage(), bay, { now });
    expect(reopened.getGame()).toEqual(before);
  });
});
