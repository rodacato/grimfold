import type { GearPiece, Place } from "../domain/content";
import { loot } from "../domain/derived";
import { BASE_SANITY, CASTS_PER_ROOM, HOLD_SIZE, MAX_SCARS } from "../domain/state";
import { t } from "../i18n/t";
import { bitesByWater, tideSheetRows } from "./d66";

const boxes = (n: number) => "☐ ".repeat(n).trim();
const GEAR: GearPiece[] = ["cana", "sedal", "farol", "motor", "casco"];
const MAX_HP = 15;
const MAP_RULES = ["map", "wreck", "island", "event", "time"];
const SEA_RULES = [
  "descend",
  "fight",
  "bleed",
  "line",
  "loot",
  "duerme",
  "sanity",
  "wanderers",
  "light",
  "farolero",
  "wakesAlone",
  "bait",
];
const CAMPAIGN_RULES = ["home", "lost"];

export function TideSheet({ place }: { place: Place }) {
  const { nodes, size } = place.map;
  return (
    <article className="sheet">
      <h1>{t("print.tide.title")}</h1>
      <p>{t("print.tide.how")}</p>
      <svg
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="sheet-map"
        role="img"
        aria-label={t("map.title")}
      >
        {nodes.flatMap((n, i) =>
          n.links
            .filter((j) => j > i)
            .map((j) => (
              <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={nodes[j]?.x} y2={nodes[j]?.y} stroke="black" />
            )),
        )}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={16} fill="white" stroke="black" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11">
              {i === place.map.dock ? "M" : i === place.map.lighthouse ? "F" : i}
            </text>
          </g>
        ))}
      </svg>
      <p>
        {t("print.tide.hp")} {boxes(MAX_HP)} <small>{t("print.tide.hpNote")}</small> ·{" "}
        {t("print.tide.sanity")} {boxes(BASE_SANITY)}
      </p>
      <p>
        {t("print.tide.hold")} {boxes(HOLD_SIZE)} · {t("print.tide.rooms")} {boxes(12)} ·{" "}
        {t("print.tide.casts", { n: CASTS_PER_ROOM })}
      </p>
      <ol className="rules">
        {MAP_RULES.map((rule) => (
          <li key={rule}>{t(`print.rule.${rule}`)}</li>
        ))}
      </ol>
      <h2>{t("print.bites.title")}</h2>
      <p>{t("print.bites.how")}</p>
      <ul className="bites" data-testid="bites">
        {bitesByWater(place).map(([water, cards]) => (
          <li key={water} data-water={water}>
            <b>
              {t(`water.${water}`)} ({t("print.bites.max", { n: place.maxDepth[water] })}):
            </b>{" "}
            {cards.map((c, i) => (
              <span key={c.id} data-creature={c.id}>
                {i + 1}. {t(`creature.${c.id}`)} ({c.depth}){" "}
              </span>
            ))}
          </li>
        ))}
      </ul>
      <table className="d66" data-testid="d66">
        <thead>
          <tr>
            <th>d66</th>
            <th>{t("print.col.creature")}</th>
            <th>{t("print.col.where")}</th>
            <th>{t("print.col.hp")}</th>
            <th>{t("print.col.loot")}</th>
            <th>{t("print.col.use")}</th>
          </tr>
        </thead>
        <tbody>
          {tideSheetRows(place).map(({ d66, creature: c }) => {
            const use = loot(place, c.loot).use;
            return (
              <tr key={d66} data-d66={d66}>
                <td>{d66}</td>
                <td>{t(`creature.${c.id}`)}</td>
                <td>{c.water ? `${t(`water.${c.water}`)} ${c.depth}` : t("fight.wanderer")}</td>
                <td>{c.unfishable ? "—" : c.hp}</td>
                <td>{t(`loot.${c.loot}`)}</td>
                <td>{use ? t(`use.${use}`) : t("use.none")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ol className="rules">
        {SEA_RULES.map((rule) => (
          <li key={rule}>{t(`print.rule.${rule}`)}</li>
        ))}
      </ol>
    </article>
  );
}

export function CampaignSheet({ place }: { place: Place }) {
  return (
    <article className="sheet">
      <h1>{t("print.campaign.title")}</h1>
      <h2>{t("dock.gear")}</h2>
      <ul>
        {GEAR.map((piece) => (
          <li key={piece}>
            {t(`gear.${piece}`)}: {[1, 2, 3].map((n) => `☐ ${t(`gear.${piece}.${n}`)}`).join(" · ")}
          </li>
        ))}
      </ul>
      <p>
        {t("print.campaign.scars", { max: MAX_SCARS })} {boxes(MAX_SCARS)}
      </p>
      <h2>{t("print.campaign.chapters")}</h2>
      <ol className="chapters">
        {place.chapters.map((c) => (
          <li key={c.id}>
            <p>
              ☐ <b>{t(`chapter.${c.id}.title`)}</b> — {t("dock.needsLight")}
              {c.wants.length > 0 && ` + ${c.wants.map((w) => t(`loot.${w}`)).join(t("dock.or"))}`}
            </p>
            <p className="voice">
              “{t(`chapter.${c.id}.says`)}” — {t(`person.${c.by}`)}
            </p>
            <p>{t(`chapter.${c.id}.hint`)}</p>
            <p className="upside-down">
              <small>{t("print.campaign.fold")}</small> {t(`chapter.${c.id}.reveals`)}
            </p>
          </li>
        ))}
      </ol>
      <ol className="rules">
        {CAMPAIGN_RULES.map((rule) => (
          <li key={rule}>{t(`print.rule.${rule}`)}</li>
        ))}
      </ol>
      <h2>{t("print.campaign.requests")}</h2>
      <ul>
        {place.requests.map((r) => (
          <li key={r.id}>
            ☐ {t(`person.${r.by}`)}: {t(`loot.${r.wants}`)} → {t(`gear.${r.gear}`)} {r.level}
          </li>
        ))}
      </ul>
      <h2>{t("nav.bestiary")}</h2>
      <p>{t("print.campaign.bestiary")}</p>
      <p>{place.creatures.map((c) => `☐☐ ${t(`creature.${c.id}`)}`).join(" · ")}</p>
      <h2>{t("print.campaign.shelf")}</h2>
      <p>{"_".repeat(60)}</p>
    </article>
  );
}

export function PrintPage({ place }: { place: Place }) {
  return (
    <div className="print">
      <nav className="no-print">
        <a href="#/">{t("nav.back")}</a>
        <button type="button" onClick={() => window.print()}>
          {t("print.go")}
        </button>
      </nav>
      <TideSheet place={place} />
      <CampaignSheet place={place} />
    </div>
  );
}
