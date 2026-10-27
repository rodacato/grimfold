import { bayArt } from "../../content/bay/art";
import type { EventId, IslandId, WreckId } from "../../domain/content";
import { creature } from "../../domain/derived";
import type { Room, Tide } from "../../domain/state";
import { CASTS_PER_ROOM } from "../../domain/state";
import { castsLeft } from "../../domain/tide/sea";
import { hasString, t } from "../../i18n/t";
import { Art } from "../Art";
import { FaroleroPuppet, useFarolero } from "../Farolero";
import { useGame } from "../game";
import { Btn, Roll, Screen } from "../Paper";
import { Items } from "../TideParts";

const DEPTHS = [1, 2, 3, 4];

const sub = (key: string): string | undefined => (hasString(`${key}.sub`) ? t(`${key}.sub`) : undefined);

function Hook({ used }: { used: boolean }) {
  return (
    <svg className={used ? "used" : ""} viewBox="0 0 14 22" aria-hidden="true">
      <path
        d="M9 1V14A4 4 0 0 1 1 14V11L4 13"
        stroke="var(--ink)"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="2.5" r="2" fill="var(--ink)" />
    </svg>
  );
}

function PlaceScene({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="scene place">
      <Art src={src} alt={alt} />
    </div>
  );
}

export function RoomView() {
  const { game, place, send } = useGame();
  const farolero = useFarolero();
  const tide = game.tide as Tide;
  const room = tide.rooms[tide.room] as Room;
  const back = <Btn onClick={() => send({ type: "openMap" })}>{t("room.back")}</Btn>;

  if (room.kind === "lighthouse") {
    if (tide.light)
      return (
        <Screen>
          <PlaceScene src={bayArt.lighthouse} alt={t("place.lighthouse")} />
          <section className="paper">
            <h2>{t("lighthouse.dark")}</h2>
          </section>
          {back}
        </Screen>
      );
    return (
      <Screen>
        <div className="scene tall">
          <Art src={bayArt.lamp} alt={t("place.lighthouse")} />
          {farolero.stage > 0 && (
            <div className="stage">
              <FaroleroPuppet
                pose="farolero-guardian"
                width={260}
                look={farolero.stage >= 3 ? "full" : farolero.stage === 2 ? "lured" : "shadow"}
              />
            </div>
          )}
        </div>
        <section className="paper dark">
          <p className="kicker">{t("lighthouse.boss")}</p>
          <h2>{t("lighthouse.title")}</h2>
        </section>
        <div className="actions">
          <Btn kind="primary" sub={t("lighthouse.steal.sub")} onClick={() => send({ type: "stealLight" })}>
            {t("lighthouse.steal")}
          </Btn>
          {back}
        </div>
      </Screen>
    );
  }

  if (room.kind === "water") {
    const max = place.maxDepth[room.water];
    const left = castsLeft(room);
    const bait = tide.bait ? creature(place, tide.bait) : null;
    const baited = bait?.water === room.water ? bait : null;
    const scene = <PlaceScene src={bayArt.water[room.water]} alt={t(`water.${room.water}`)} />;
    const kicker = (
      <p className="kicker">
        {t("room.water")} · {t(`water.${room.water}`)}
      </p>
    );
    if (left === 0)
      return (
        <Screen>
          {scene}
          <section className="paper">
            {kicker}
            <h2>{t("water.empty")}</h2>
            <p className="small voice">{t("water.empty.voice")}</p>
          </section>
          {back}
          <Items when="map" />
        </Screen>
      );
    return (
      <Screen>
        {scene}
        <section className="paper">
          {kicker}
          <div className="versus">
            <h2>{t("water.depth", { n: tide.depth, max })}</h2>
            <span className="hooks" role="img" aria-label={t("water.casts", { n: left })}>
              {Array.from({ length: CASTS_PER_ROOM }, (_, i) => (
                <Hook key={i} used={i >= left} />
              ))}
            </span>
          </div>
          <div className="depth">
            {DEPTHS.map((d) => (
              <i key={d} className={d === tide.depth ? "here" : d > max ? "closed" : ""}>
                {d}
              </i>
            ))}
          </div>
          {baited && <p className="small voice">{t("water.bait", { n: baited.depth })}</p>}
          {tide.lastRoll && <Roll dice={tide.lastRoll} rollKey={game.rng} />}
        </section>
        <div className="actions">
          <Btn
            kind="primary"
            sub={left === 1 ? t("water.cast.last") : t("water.cast.sub", { n: left })}
            onClick={() => send({ type: "cast" })}
          >
            {t("water.cast")}
          </Btn>
          {tide.depth < max && (
            <Btn
              sub={t("water.descend.sub", { n: tide.depth + 1 })}
              onClick={() => send({ type: "descend" })}
            >
              {t("water.descend", { n: tide.depth + 1 })}
            </Btn>
          )}
          {back}
        </div>
        <Items when="map" />
      </Screen>
    );
  }

  if (room.resolved) {
    const art =
      room.kind === "island"
        ? bayArt.island[room.content as IslandId]
        : room.kind === "wreck"
          ? bayArt.wreck[room.content as WreckId]
          : bayArt.event[room.content as EventId];
    return (
      <Screen>
        <div className="scene place spent">
          <Art src={art} alt={t(`room.${room.kind}`)} />
        </div>
        <section className="paper">
          <p className="kicker">{t(`room.${room.kind}`)}</p>
          <h2>{t("room.visited")}</h2>
          {tide.lastRoll && <Roll dice={tide.lastRoll} rollKey={game.rng} />}
        </section>
        {back}
      </Screen>
    );
  }

  if (room.kind === "island") {
    const id = room.content as IslandId;
    return (
      <Screen>
        <PlaceScene src={bayArt.island[id]} alt={t(`island.${id}.text`)} />
        <section className="paper">
          <p className="kicker">{t("room.island")}</p>
          <h2>{t(`island.${id}.text`)}</h2>
        </section>
        <div className="actions">
          <Btn kind="primary" sub={sub(`island.${id}.yes`)} onClick={() => send({ type: "explore" })}>
            {t(`island.${id}.yes`)}
          </Btn>
          {back}
        </div>
      </Screen>
    );
  }

  const prefix = room.kind === "wreck" ? "wreck" : "event";
  const id = room.content as WreckId | EventId;
  const art = room.kind === "wreck" ? bayArt.wreck[id as WreckId] : bayArt.event[id as EventId];
  return (
    <Screen>
      <PlaceScene src={art} alt={t(`${prefix}.${id}.text`)} />
      <section className={`paper ${room.kind === "event" ? "dark" : ""}`}>
        <p className="kicker">{t(`room.${room.kind}`)}</p>
        <h2>{t(`${prefix}.${id}.text`)}</h2>
      </section>
      <div className="actions two">
        <Btn
          kind="primary"
          sub={sub(`${prefix}.${id}.yes`)}
          onClick={() => send({ type: "decide", yes: true })}
        >
          {t(`${prefix}.${id}.yes`)}
        </Btn>
        <Btn sub={sub(`${prefix}.${id}.no`)} onClick={() => send({ type: "decide", yes: false })}>
          {t(`${prefix}.${id}.no`)}
        </Btn>
      </div>
    </Screen>
  );
}
