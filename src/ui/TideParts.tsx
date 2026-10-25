import { useEffect, useState } from "react";
import type { ItemUse } from "../domain/content";
import { chapterReady, loot, maxHp, requestWanting } from "../domain/derived";
import { BASE_SANITY, HOLD_SIZE, type Tide } from "../domain/state";
import { distance } from "../domain/tide/map";
import { t } from "../i18n/t";
import { LootIcon } from "./Art";
import { useFarolero } from "./Farolero";
import { useGame } from "./game";

/** The Cordura at which each next change happens, read by the eye that will close there. */
const MARK_LINE = { ojos: 4, brazo: 2, marca: 0 } as const;

function nextMark(tide: Tide): keyof typeof MARK_LINE {
  if (tide.sanity > MARK_LINE.ojos && !tide.mutations.includes("ojos")) return "ojos";
  if (tide.sanity > MARK_LINE.brazo && !tide.mutations.includes("brazo")) return "brazo";
  return "marca";
}

export function Status({ tide }: { tide: Tide }) {
  const { game, place } = useGame();
  const farolero = useFarolero();
  const [holdOpen, setHoldOpen] = useState(false);
  const room = tide.rooms[tide.room];
  const max = maxHp(game.campaign);
  const where =
    tide.room === place.map.dock
      ? t("place.dock")
      : tide.room === place.map.lighthouse
        ? t("place.lighthouse")
        : t("place.room", { n: tide.room, water: t(`water.${room?.water}`) });
  const next = nextMark(tide);
  const eye = (i: number) =>
    `${i >= tide.ceiling ? "capped" : i < tide.sanity ? "" : "shut"} ${i === MARK_LINE[next] ? "edge" : ""}`;
  useEffect(() => {
    const dread = Math.max(0, BASE_SANITY - tide.sanity) / BASE_SANITY;
    document.documentElement.style.setProperty("--dread", dread.toFixed(2));
    return () => {
      document.documentElement.style.removeProperty("--dread");
    };
  }, [tide.sanity]);
  return (
    <header className={`strip ${holdOpen ? "open" : ""}`}>
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
          <small className="next">{t(`status.sanityNext.${next}`)}</small>
        </span>
        <button
          type="button"
          className="hold-toggle"
          aria-expanded={holdOpen}
          onClick={() => setHoldOpen(!holdOpen)}
        >
          {t("status.hold", { n: tide.hold.length, max: HOLD_SIZE })} {holdOpen ? "▴" : "▾"}
        </button>
        {tide.light && (
          <span className="badge named">
            <LootIcon id="luz" />
            {t("status.light")}
          </span>
        )}
        {tide.farolero !== null && tide.phase !== "end" && (
          <span className="badge chase">
            {t("status.farolero", {
              farolero: farolero.name,
              n: distance(place.map.nodes, tide.farolero, tide.room),
            })}
          </span>
        )}
      </div>
      {holdOpen && <HoldGuide tide={tide} />}
    </header>
  );
}

const WHEN: Record<ItemUse, string> = {
  golpe: "when.fight",
  nudo: "when.fight",
  ojo: "when.fight",
  calma: "when.any",
  huida: "when.chase",
};

/** What each thing in the Bodega is for: a use now, or a reason to bring it home. */
function HoldGuide({ tide }: { tide: Tide }) {
  const { game, place } = useGame();
  const c = game.campaign;
  const chapter = place.chapters[c.chapter];
  if (!tide.hold.length) return <p className="hold-guide small">{t("hold.empty")}</p>;
  return (
    <ul className="hold-guide">
      {tide.hold.map((id, i) => {
        const use = loot(place, id).use;
        const request = requestWanting(place, c, id);
        const forChapter = chapter?.wants.includes(id) && !chapterReady(place, c);
        return (
          <li key={`${id}-${i}`}>
            <b className="named">
              <LootIcon id={id} />
              {t(`loot.${id}`)}
            </b>
            <small>{use ? `${t(WHEN[use])} · ${t(`use.${use}`)}` : t("use.none")}</small>
            {forChapter && chapter && (
              <small className="home">{t("loot.forChapter", { who: t(`person.${chapter.by}`) })}</small>
            )}
            {request && (
              <small className="home">
                {t("loot.wanted", {
                  who: t(`person.${request.by}`),
                  gear: t(`gear.${request.gear}`),
                  level: request.level,
                })}
              </small>
            )}
          </li>
        );
      })}
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
      <button
        type="button"
        className="item"
        key={`${id}-${index}`}
        onClick={() => send({ type: "useItem", index })}
      >
        <span className="named">
          <LootIcon id={id} />
          {t(`loot.${id}`)}
        </span>
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
