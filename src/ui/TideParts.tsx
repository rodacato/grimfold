import type { ItemUse } from "../domain/content";
import { loot, maxHp } from "../domain/derived";
import type { Note, Tide } from "../domain/state";
import { distance } from "../domain/tide/map";
import { t } from "../i18n/t";
import { useGame } from "./game";

export function Status({ tide }: { tide: Tide }) {
  const { game, place } = useGame();
  const room = tide.rooms[tide.room];
  const where =
    tide.room === place.map.dock
      ? t("place.dock")
      : tide.room === place.map.lighthouse
        ? t("place.lighthouse")
        : t("place.room", { n: tide.room, water: t(`water.${room?.water}`) });
  return (
    <header className="status">
      <strong>{where}</strong> · {t("status.tide", { n: tide.number })}
      <div>
        {t("status.hp", { n: tide.hp, max: maxHp(game.campaign) })} ·{" "}
        {t("status.sanity", { n: tide.sanity, max: tide.ceiling })} ·{" "}
        {t("status.hold", { n: tide.hold.length })}
        {tide.light && <> · {t("status.light")}</>}
        {tide.farolero !== null && tide.phase !== "end" && (
          <> · {t("status.farolero", { n: distance(place.map.nodes, tide.farolero, tide.room) })}</>
        )}
      </div>
    </header>
  );
}

export function Notes({ notes }: { notes: Note[] }) {
  if (!notes.length) return null;
  return (
    <ul className="notes" aria-live="polite">
      {notes.map((n, i) => (
        <li key={`${n.key}-${i}`} className={n.bad ? "bad" : ""}>
          {t(n.key, n.params)}
        </li>
      ))}
    </ul>
  );
}

type When = "fight" | "map" | "chase";

const usableWhen = (use: ItemUse, when: When, chased: boolean): boolean =>
  use === "calma" || (use === "huida" ? chased : when === "fight");

export function Items({ when }: { when: When }) {
  const { game, place, send } = useGame();
  const tide = game.tide as Tide;
  const buttons = tide.hold.flatMap((id, index) => {
    const use = loot(place, id).use;
    if (!use || !usableWhen(use, when, tide.farolero !== null)) return [];
    return [
      <button type="button" key={`${id}-${index}`} onClick={() => send({ type: "useItem", index })}>
        {t(`loot.${id}`)} — {t(`use.${use}`)}
      </button>,
    ];
  });
  if (!buttons.length) return null;
  return (
    <section>
      <h3>{t("items.title")}</h3>
      {buttons}
    </section>
  );
}

export function Dice({ dice }: { dice: number[] }) {
  return <span className="dice">{dice.map((d) => `⚀⚁⚂⚃⚄⚅`[d - 1]).join(" ")}</span>;
}
