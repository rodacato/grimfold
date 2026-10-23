import { useState } from "react";
import type { Room, Tide } from "../../domain/state";
import { blocked, isNeighbor, visible } from "../../domain/tide/map";
import { castsLeft } from "../../domain/tide/sea";
import { t } from "../../i18n/t";
import { useGame } from "../game";
import { Items } from "../TideParts";

const WATER_FILL = { rio: "#9bb9a7", lago: "#5f9497", mar: "#2f6676", profundo: "#0b1c20" };

export function SeaMap() {
  const { game, place, send } = useGame();
  const tide = game.tide as Tide;
  const [chosen, setChosen] = useState<number | null>(null);
  const { nodes, dock, lighthouse } = place.map;
  const seen = (i: number) => visible(place, game.campaign, tide, i);
  const label = (i: number, room: Room) =>
    i === dock ? t("place.dock") : i === lighthouse ? t("place.lighthouse") : t(`room.${room.kind}`);
  const here = tide.rooms[tide.room] as Room;
  const canStay = tide.room !== dock && !(here.kind === "water" && !castsLeft(here));
  const target = chosen === null ? null : (tide.rooms[chosen] as Room);

  return (
    <main>
      <svg viewBox="0 0 340 300" className="sea-map" role="img" aria-label={t("map.title")}>
        <rect width="340" height="300" fill="#e2d6b8" />
        {nodes.flatMap((n, i) =>
          n.links
            .filter((j) => j > i && seen(i) && seen(j))
            .map((j) => (
              <line
                key={`${i}-${j}`}
                x1={n.x}
                y1={n.y}
                x2={nodes[j]?.x}
                y2={nodes[j]?.y}
                stroke="#2b2926"
                strokeDasharray="6 5"
              />
            )),
        )}
        {nodes.map((n, i) => {
          const room = tide.rooms[i] as Room;
          if (!seen(i))
            return <ellipse key={i} cx={n.x} cy={n.y} rx={30} ry={18} fill="#9aa39b" opacity={0.7} />;
          const near = isNeighbor(nodes, tide.room, i);
          return (
            <g
              key={i}
              data-room={i}
              className={near ? "near" : ""}
              {...(near && {
                role: "button",
                tabIndex: 0,
                "aria-label": label(i, room),
                onClick: () => setChosen(i),
                onKeyDown: (e: { key: string }) => e.key === "Enter" && setChosen(i),
              })}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={17}
                fill={WATER_FILL[room.water]}
                stroke="#2b2926"
                strokeWidth={chosen === i ? 5 : 2}
              />
              <text x={n.x} y={n.y + 31} textAnchor="middle" fontSize="11">
                {label(i, room)}
                {blocked(game.campaign, room) ? " 🔒" : ""}
              </text>
            </g>
          );
        })}
        {tide.farolero !== null && (
          <text
            x={nodes[tide.farolero]?.x}
            y={(nodes[tide.farolero]?.y ?? 0) - 22}
            textAnchor="middle"
            fontSize="18"
          >
            ☗
          </text>
        )}
        <text x={nodes[tide.room]?.x} y={(nodes[tide.room]?.y ?? 0) + 5} textAnchor="middle" fontSize="16">
          ⛵
        </text>
      </svg>

      {target && chosen !== null && (
        <section>
          <p className="kicker">
            {t(`room.${target.kind}`)} · {t(`water.${target.water}`)}
          </p>
          <h2>
            {chosen === dock ? t(tide.light ? "map.homeLight" : "map.homeDark") : label(chosen, target)}
          </h2>
          {blocked(game.campaign, target) && <p className="bad">{t("map.needsHull")}</p>}
          {tide.farolero === chosen && <p className="bad">{t("map.faroleroThere")}</p>}
          <button
            type="button"
            className="primary"
            disabled={blocked(game.campaign, target)}
            onClick={() => {
              setChosen(null);
              send({ type: "navigate", room: chosen });
            }}
          >
            {t("map.sail")}
          </button>
        </section>
      )}
      {!target && canStay && (
        <button type="button" onClick={() => send({ type: "stayHere" })}>
          {t("map.stay")}
        </button>
      )}
      <Items when="map" />
    </main>
  );
}
