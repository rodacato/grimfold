import { openDB } from "idb";
import type { Save, SaveStorage } from "../app/store";

const DB = "grimfold";
const STORE = "saves";
const KEY = "current";
const JOURNAL = "grimfold-journal";

/** IndexedDB writes are async; a synchronous journal covers the app closing before one lands. */
export function indexedDbStorage(): SaveStorage {
  const db = openDB(DB, 1, {
    upgrade(database) {
      database.createObjectStore(STORE);
    },
  });
  const journal = typeof localStorage === "undefined" ? null : localStorage;

  return {
    async read() {
      const stored = (await (await db).get(STORE, KEY)) as Save | undefined;
      const pending = readJournal(journal);
      if (pending && pending.actions.length > (stored?.actions.length ?? -1)) return pending;
      return stored;
    },
    journal(save) {
      try {
        journal?.setItem(JOURNAL, JSON.stringify(save));
      } catch {
        // A full or blocked localStorage only loses the journal; IndexedDB still gets the save.
      }
    },
    async write(save) {
      await (await db).put(STORE, save, KEY);
      if (readJournal(journal)?.actions.length === save.actions.length) journal?.removeItem(JOURNAL);
    },
  };
}

function readJournal(journal: Storage | null): Save | undefined {
  try {
    const raw = journal?.getItem(JOURNAL);
    return raw ? (JSON.parse(raw) as Save) : undefined;
  } catch {
    return undefined;
  }
}
