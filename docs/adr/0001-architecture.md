# 0001 · The game is a pure function of a seed and its actions

Date: 2026-10-23 · Status: accepted

## Context

The MVP has to stay maintainable past its first version, and the brief already names what comes
after it: more Lugares and Personajes, puppets, the same rules on paper, a session log that measures
the bet, and maybe, one day, paper ↔ web sync. The brief also requires that closing the app
mid-Marea restores the exact state (N8), and that balance is proven by simulation (N5, N6).

## Decision

- **The rules are a pure TypeScript domain with no DOM and no storage.** `reduce(game, action)`
  returns the next game; dice come from a seeded generator kept in the state. The game is
  `actions.reduce(reduce, newGame(seed))`.
- **What is saved is the seed and the action list**, in IndexedDB. Resuming replays them, a bug
  report is a seed plus its actions, and the balance simulations run the same reducer with no UI.
- **A Lugar is data.** `src/content/<lugar>/` holds its creatures, loot, requests, chapters and
  rooms; the engine never names a creature. Its text lives in a locale file next to it (N10).
- **Code is organized by domain context** (`campaign`, `tide`), then `app` (store and
  persistence), `ui`, and `print`, which renders the paper sheets from the same content.
- **Stack:** React 19, Vite, vite-plugin-pwa, idb, Vitest, Playwright, Biome. Deployed to GitHub
  Pages as a static site.

## Alternatives

- **Preact.** Same API in 4 KB; React chosen for its ecosystem and for Adrian's career, at a cost
  of ~40 KB in an app that is downloaded once and played offline.
- **Saving snapshots instead of actions.** Simpler to load, but loses replay, reproducible bugs
  and the session log for free.
- **A runtime schema library for content.** Unnecessary while content is TypeScript: the types and
  one integrity test catch the same mistakes. Revisit if content is authored outside the code.
- **A canvas engine (PixiJS).** The puppets are a few rotated DOM pieces, which CSS already does.

## Consequences

- Every rule change is testable without a browser, and a simulation is a loop over the reducer.
- A rule change can break replay of a saved game; the save carries a version, and an old version
  starts a new Marea instead of replaying wrongly.
- The reducer clones the state on each action. Cheap at this size; revisit only if a profile says
  so.
