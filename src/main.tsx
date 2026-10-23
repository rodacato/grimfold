import { registerSW } from "virtual:pwa-register";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createStore } from "./app/store";
import { bay } from "./content/bay";
import { indexedDbStorage } from "./infra/indexeddb";
import { App } from "./ui/App";
import { StoreContext } from "./ui/game";
import "./ui/styles.css";

registerSW({ immediate: true });

const seed = Number(new URLSearchParams(window.location.search).get("semilla")) || undefined;
const store = await createStore(indexedDbStorage(), bay, { seed });
(window as unknown as { grimfold: unknown }).grimfold = store;

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <StoreContext.Provider value={{ store, place: bay }}>
      <App />
    </StoreContext.Provider>
  </StrictMode>,
);
