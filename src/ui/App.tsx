import { useEffect, useState } from "react";
import { PrintPage } from "../print/Sheets";
import { useGame } from "./game";
import { FaroleroView, TideEndView } from "./screens/Chase";
import { Dock } from "./screens/Dock";
import { Bite, FightView, LootView } from "./screens/Fishing";
import { Bestiary, Sessions } from "./screens/Records";
import { RoomView } from "./screens/RoomView";
import { SeaMap } from "./screens/SeaMap";
import { Notes, Status } from "./TideParts";

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}

const PHASES = {
  map: SeaMap,
  room: RoomView,
  bite: Bite,
  fight: FightView,
  loot: LootView,
  farolero: FaroleroView,
  end: TideEndView,
};

export function App() {
  const { game, place } = useGame();
  const hash = useHash();
  if (hash === "#/imprimir") return <PrintPage place={place} />;
  if (hash === "#/bestiario") return <Bestiary />;
  if (hash === "#/registro") return <Sessions />;
  if (!game.tide) return <Dock />;
  const Screen = PHASES[game.tide.phase];
  return (
    <>
      <Status tide={game.tide} />
      <Notes notes={game.notes} />
      <Screen />
    </>
  );
}
