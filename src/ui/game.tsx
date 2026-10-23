import { createContext, useContext, useSyncExternalStore } from "react";
import type { Store } from "../app/store";
import type { Command } from "../domain/actions";
import type { Place } from "../domain/content";
import type { Ctx } from "../domain/derived";
import type { Game } from "../domain/state";

export interface GameContext {
  store: Store;
  place: Place;
}

export const StoreContext = createContext<GameContext | null>(null);

export interface UseGame {
  game: Game;
  place: Place;
  /** A read-only context for the domain's selectors; never mutate through it. */
  ctx: Ctx;
  send: (command: Command) => void;
}

export function useGame(): UseGame {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useGame outside the store provider");
  const { store, place } = value;
  const game = useSyncExternalStore(store.subscribe, store.getGame);
  return { game, place, ctx: { g: game, place, at: 0 }, send: store.dispatch };
}
