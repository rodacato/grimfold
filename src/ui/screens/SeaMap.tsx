import { useState } from "react";
import type { Room, Tide } from "../../domain/state";
import { blocked, isNeighbor, visible } from "../../domain/tide/map";
import { castsLeft } from "../../domain/tide/sea";
import { t } from "../../i18n/t";
import { useGame } from "../game";
import { Btn, Screen } from "../Paper";
import { Items } from "../TideParts";

const WATER_FILL = { rio: "#9bb9a7", lago: "#5f9497", mar: "#2f6676", profundo: "#0b1c20" };
const SPENT = "#8d9690";

function Boat({ x, y }: { x: number; y: number }) {
  return (
    <svg
      className="here"
      x={x - 22}
      y={y - 32}
      width="44"
      height="26"
      viewBox="0 0 200 110"
      aria-hidden="true"
    >
      <path d="M60 8H64V70H60Z" fill="#3b2618" />
      <circle cx="62" cy="27" r="13" fill="var(--lamp)" opacity=".3" />
      <path d="M55 20H69L70 34H54Z" fill="var(--lamp)" />
      <path d="M100 30H140V62H100Z" fill="var(--cream)" />
      <path d="M96 32L120 18L144 32Z" fill="var(--rust)" />
      <path d="M10 60L192 56L176 96C140 106 60 106 26 96Z" fill="#8a5a3b" />
      <path d="M10 58L192 54L190 61L12 65Z" fill="#c69a6a" />
    </svg>
  );
}

function FaroleroMark({ x, y }: { x: number; y: number }) {
  return (
    <svg x={x - 20} y={y - 46} width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M6 24C6 12 18 8 28 10C36 12 38 22 34 30L22 34C14 34 6 30 6 24Z" fill="var(--ink)" />
      <path d="M10 22L14 26L16 21L19 26L21 21" stroke="var(--cream)" strokeWidth="1.6" fill="none" />
      <circle cx="24" cy="18" r="3.4" fill="var(--rust)" />
      <path d="M14 12C10 4 4 4 2 8" stroke="var(--ink)" strokeWidth="2" fill="none" />
      <circle cx="2" cy="9" r="3" fill="var(--lamp)" />
    </svg>
  );
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 6} ${y - 2}h12v10h-12z M${x - 4} ${y - 2}v-4a4 4 0 0 1 8 0v4`}
      fill="var(--rust)"
      stroke="var(--cream)"
      strokeWidth="1.5"
    />
  );
}

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
  const lampGlow = (i: number) =>
    i === lighthouse &&
    !tide.light && <circle cx={nodes[i]?.x} cy={nodes[i]?.y} r="26" fill="var(--lamp)" opacity=".35" />;

  return (
    <Screen>
      <section className="paper chart">
        <svg viewBox="0 0 340 300" role="img" aria-label={t("map.title")}>
          <rect width="340" height="300" fill="var(--card)" />
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
                  stroke="var(--ink)"
                  strokeWidth="2.4"
                  strokeDasharray="6 5"
                />
              )),
          )}
          {nodes.map((n, i) => {
            const room = tide.rooms[i] as Room;
            if (!seen(i))
              return (
                <g key={i}>
                  {lampGlow(i) || (
                    <ellipse cx={n.x} cy={n.y} rx={30} ry={18} fill="var(--mist)" opacity={0.7} />
                  )}
                </g>
              );
            const near = isNeighbor(nodes, tide.room, i);
            const spent = room.kind === "water" && !castsLeft(room);
            return (
              <g
                key={i}
                data-room={i}
                {...(near && {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": label(i, room),
                  onClick: () => setChosen(i),
                  onKeyDown: (e: { key: string }) => e.key === "Enter" && setChosen(i),
                })}
              >
                {lampGlow(i)}
                <circle
                  className={chosen === i ? "chosen" : ""}
                  cx={n.x}
                  cy={n.y}
                  r={17}
                  fill={spent ? SPENT : WATER_FILL[room.water]}
                  stroke="var(--ink)"
                  strokeWidth="2.4"
                />
                {blocked(game.campaign, room) && <Lock x={n.x} y={n.y} />}
                <text x={n.x} y={n.y + 31} textAnchor="middle">
                  {label(i, room)}
                </text>
              </g>
            );
          })}
          <Boat x={nodes[tide.room]?.x ?? 0} y={nodes[tide.room]?.y ?? 0} />
          {tide.farolero !== null && (
            <FaroleroMark x={nodes[tide.farolero]?.x ?? 0} y={nodes[tide.farolero]?.y ?? 0} />
          )}
        </svg>
      </section>

      {target && chosen !== null && (
        <section className="paper">
          <p className="kicker">
            {t(`room.${target.kind}`)} · {t(`water.${target.water}`)}
          </p>
          <h2>
            {chosen === dock ? t(tide.light ? "map.homeLight" : "map.homeDark") : label(chosen, target)}
          </h2>
          {blocked(game.campaign, target) && <p className="warn">{t("map.needsHull")}</p>}
          {tide.farolero === chosen && <p className="warn">{t("map.faroleroThere")}</p>}
          <Btn
            kind="primary"
            disabled={blocked(game.campaign, target)}
            onClick={() => {
              setChosen(null);
              send({ type: "navigate", room: chosen });
            }}
          >
            {t("map.sail")}
          </Btn>
        </section>
      )}
      {!target && canStay && <Btn onClick={() => send({ type: "stayHere" })}>{t("map.stay")}</Btn>}
      <Items when="map" />
    </Screen>
  );
}
