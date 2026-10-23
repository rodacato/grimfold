import type { ItemUse } from "../domain/content";
import { loot, maxHp } from "../domain/derived";
import { BASE_SANITY, HOLD_SIZE, type Tide } from "../domain/state";
import { distance } from "../domain/tide/map";
import { t } from "../i18n/t";
import { useGame } from "./game";

export function Status({ tide }: { tide: Tide }) {
  const { game, place } = useGame();
  const room = tide.rooms[tide.room];
  const max = maxHp(game.campaign);
  const where =
    tide.room === place.map.dock
      ? t("place.dock")
      : tide.room === place.map.lighthouse
        ? t("place.lighthouse")
        : t("place.room", { n: tide.room, water: t(`water.${room?.water}`) });
  const eye = (i: number) => (i >= tide.ceiling ? "capped" : i < tide.sanity ? "" : "shut");
  return (
    <header className="strip">
      <div className="row">
        <h1>{where}</h1>
        <span className="tag">{t("status.tide", { n: tide.number })}</span>
      </div>
      <div className="counters">
        <span>
          {t("status.hpLabel")}
          <span className="drops" role="img" aria-label={t("status.hp", { n: tide.hp, max })}>
            {Array.from({ length: max }, (_, i) => (
              <i key={i} className={i < tide.hp ? "" : "gone"} />
            ))}
          </span>
        </span>
        <span>
          {t("status.sanityLabel")}
          <span
            className="eyes"
            role="img"
            aria-label={t("status.sanity", { n: tide.sanity, max: tide.ceiling })}
          >
            {Array.from({ length: BASE_SANITY }, (_, i) => (
              <i key={i} className={eye(i)} />
            ))}
          </span>
        </span>
        <span>{t("status.hold", { n: tide.hold.length, max: HOLD_SIZE })}</span>
        {tide.light && <span className="badge">{t("status.light")}</span>}
        {tide.farolero !== null && tide.phase !== "end" && (
          <span className="badge chase">
            {t("status.farolero", { n: distance(place.map.nodes, tide.farolero, tide.room) })}
          </span>
        )}
      </div>
    </header>
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
      <button
        type="button"
        className="item"
        key={`${id}-${index}`}
        onClick={() => send({ type: "useItem", index })}
      >
        {t(`loot.${id}`)}
        <em>{t(`use.${use}`)}</em>
      </button>,
    ];
  });
  if (!buttons.length) return null;
  return (
    <section className="items">
      <span className="kicker">{t("items.title")}</span>
      {buttons}
    </section>
  );
}
