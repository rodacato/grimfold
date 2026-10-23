import { type Action, type Command, reduce } from "../domain/actions";
import type { Place } from "../domain/content";
import { type Game, newGame, SAVE_VERSION } from "../domain/state";

export interface Save {
  version: number;
  seed: number;
  actions: Action[];
}

export interface SaveStorage {
  read(): Promise<Save | undefined>;
  write(save: Save): Promise<void>;
  /** Records the save synchronously, before `write` lands. */
  journal?(save: Save): void;
}

export const replay = (save: Save, place: Place): Game =>
  save.actions.reduce((game, action) => reduce(game, action, place), newGame(save.seed, place.id));

export interface Store {
  getGame(): Game;
  subscribe(listener: () => void): () => void;
  dispatch(command: Command): void;
  exportSave(): Save;
}

export async function createStore(
  storage: SaveStorage,
  place: Place,
  options: { seed?: number; now?: () => number } = {},
): Promise<Store> {
  const now = options.now ?? Date.now;
  const stored = await storage.read();
  const save: Save =
    stored?.version === SAVE_VERSION
      ? stored
      : { version: SAVE_VERSION, seed: options.seed ?? Math.floor(Math.random() * 2 ** 31) + 1, actions: [] };
  let game = replay(save, place);
  const listeners = new Set<() => void>();
  let writing = Promise.resolve();

  return {
    getGame: () => game,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch(command) {
      const action = { ...command, at: now() } as Action;
      game = reduce(game, action, place);
      save.actions.push(action);
      const snapshot = { ...save, actions: [...save.actions] };
      storage.journal?.(snapshot);
      writing = writing.then(() => storage.write(snapshot));
      for (const listener of listeners) listener();
    },
    exportSave: () => structuredClone(save),
  };
}
