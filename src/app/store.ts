import { type Action, type Command, reduce } from "../domain/actions";
import type { Place } from "../domain/content";
import { type Game, newGame, SAVE_VERSION } from "../domain/state";

/** What outlives a save the current rules cannot replay: the Bestiario, the Registro, the Farolero seen. */
export type Carried = Pick<Game, "bestiary" | "caught" | "sightings" | "sessions">;

export interface Save {
  version: number;
  seed: number;
  actions: Action[];
  /** Applied before the first action. */
  carried?: Carried;
  /** The latest Carried, written with every save and read only when the save cannot be replayed. */
  keep?: Carried;
}

export interface SaveStorage {
  read(): Promise<Save | undefined>;
  write(save: Save): Promise<void>;
  /** Records the save synchronously, before `write` lands. */
  journal?(save: Save): void;
}

const carry = (g: Game): Carried => ({
  bestiary: g.bestiary,
  caught: g.caught,
  sightings: g.sightings,
  sessions: g.sessions,
});

export const replay = (save: Save, place: Place): Game =>
  save.actions.reduce((game, action) => reduce(game, action, place), {
    ...newGame(save.seed, place.id),
    ...structuredClone(save.carried),
  } as Game);

export interface Store {
  getGame(): Game;
  subscribe(listener: () => void): () => void;
  dispatch(command: Command): void;
  /** A new game that keeps what Carried keeps: the way out of a save that breaks the screen. */
  reset(): void;
}

export async function createStore(
  storage: SaveStorage,
  place: Place,
  options: { seed?: number; now?: () => number } = {},
): Promise<Store> {
  const now = options.now ?? Date.now;
  const newSeed = () => options.seed ?? Math.floor(Math.random() * 2 ** 31) + 1;
  const fresh = (carried?: Carried): Save => ({
    version: SAVE_VERSION,
    seed: newSeed(),
    actions: [],
    carried,
  });
  const stored = await storage.read().catch(() => undefined);

  let save = fresh(stored?.keep ?? stored?.carried);
  let game: Game;
  try {
    if (stored?.version !== SAVE_VERSION) throw new Error("old rules");
    game = replay(stored, place);
    save = stored;
  } catch {
    game = replay(save, place);
  }
  const listeners = new Set<() => void>();
  let writing = Promise.resolve();

  const persist = () => {
    const snapshot = { ...save, actions: [...save.actions], keep: carry(game) };
    storage.journal?.(snapshot);
    writing = writing.then(() => storage.write(snapshot)).catch((error) => console.error(error));
    for (const listener of listeners) listener();
  };

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
      persist();
    },
    reset() {
      save = fresh(carry(game));
      game = replay(save, place);
      persist();
    },
  };
}
