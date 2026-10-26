import { useState } from "react";
import { bayArt } from "../../content/bay/art";
import type { RoomKind, WaterType } from "../../domain/content";
import type { Room, Tide } from "../../domain/state";
import { blocked, isNeighbor, visible } from "../../domain/tide/map";
import { castsLeft } from "../../domain/tide/sea";
import { t } from "../../i18n/t";
import { artUrl } from "../Art";
import { useFarolero } from "../Farolero";
import { useGame } from "../game";
import { Btn, Screen } from "../Paper";
import { Items } from "../TideParts";

const WATER_FILL = { rio: "#9bb9a7", lago: "#5f9497", mar: "#2f6676", profundo: "#0b1c20" };
const SPENT = "#8d9690";
const DARK_WATER = new Set<WaterType>(["mar", "profundo"]);

/** Cut-paper marks drawn on a 20×20 box centered on the node. */
const GLYPHS: Record<RoomKind, string> = {
  dock: "M4 6h12v3H4z M6 9h2v8H6z M12 9h2v8h-2z",
  water: "M2 8c3-3 5 3 8 0s5 3 8 0 M2 13c3-3 5 3 8 0s5 3 8 0",
  wreck: "M3 15l14-3-1 4H5z M9 13L11 3l1 9 M11 4l5 4-5 1",
  island: "M2 16c3-5 13-5 16 0z M10 13V5 M10 5c-3-2-6 0-7 2 M10 5c3-2 6 0 7 2",
  event: "M7 7c0-4 6-4 6 0 0 2-3 3-3 5v1 M10 16v1",
  lighthouse: "M7 17l1-11h4l1 11z M8 6l2-3 2 3 M5 9h2 M13 9h2",
};

function Glyph({ kind, x, y, dark }: { kind: RoomKind; x: number; y: number; dark: boolean }) {
  const filled = kind === "dock" || kind === "wreck" || kind === "island" || kind === "lighthouse";
  const ink = dark ? "var(--cream)" : "var(--ink)";
  return (
    <path
      d={GLYPHS[kind]}
      transform={`translate(${x - 10} ${y - 10})`}
      fill={filled ? ink : "none"}
      stroke={ink}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

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
  const farolero = useFarolero();
  const tide = game.tide as Tide;
  const [chosen, setChosen] = useState<number | null>(null);
  const { nodes, dock, lighthouse, size } = place.map;
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
        <svg viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-label={t("map.title")}>
          <rect width={size.width} height={size.height} fill="var(--sea)" />
          <image
            href={artUrl(bayArt.chart)}
            width={size.width}
            height={size.height}
            preserveAspectRatio="xMidYMid slice"
          />
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
                  className="route"
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
                {blocked(game.campaign, room) ? (
                  <Lock x={n.x} y={n.y} />
                ) : (
                  <Glyph kind={room.kind} x={n.x} y={n.y} dark={!spent && DARK_WATER.has(room.water)} />
                )}
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
          {tide.farolero === chosen && (
            <p className="warn">{t("map.faroleroThere", { farolero: farolero.name })}</p>
          )}
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
