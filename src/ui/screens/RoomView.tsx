import { bayArt } from "../../content/bay/art";
import type { EventId, IslandId, WreckId } from "../../domain/content";
import type { Room, Tide } from "../../domain/state";
import { castsLeft } from "../../domain/tide/sea";
import { t } from "../../i18n/t";
import { Art } from "../Art";
import { useGame } from "../game";
import { Dice, Items } from "../TideParts";

export function RoomView() {
  const { game, place, send } = useGame();
  const tide = game.tide as Tide;
  const room = tide.rooms[tide.room] as Room;
  const back = (
    <button type="button" onClick={() => send({ type: "openMap" })}>
      {t("room.back")}
    </button>
  );

  if (room.kind === "lighthouse") {
    if (tide.light)
      return (
        <main>
          <h2>{t("lighthouse.dark")}</h2>
          {back}
        </main>
      );
    return (
      <main>
        <Art src={bayArt.lamp} alt={t("place.lighthouse")} />
        <p className="kicker">{t("lighthouse.boss")}</p>
        <h2>{t("lighthouse.title")}</h2>
        <button type="button" className="primary" onClick={() => send({ type: "stealLight" })}>
          {t("lighthouse.steal")}
        </button>
        {back}
      </main>
    );
  }

  if (room.kind === "water") {
    const max = place.maxDepth[room.water];
    const left = castsLeft(room);
    return (
      <main>
        <Art src={bayArt.water[room.water]} alt={t(`water.${room.water}`)} />
        <p className="kicker">
          {t("room.water")} · {t(`water.${room.water}`)}
        </p>
        {left === 0 ? (
          <h2>{t("water.empty")}</h2>
        ) : (
          <>
            <h2>{t("water.depth", { n: tide.depth, max })}</h2>
            {tide.lastRoll && <Dice dice={tide.lastRoll} />}
            <button type="button" className="primary" onClick={() => send({ type: "cast" })}>
              {t("water.cast", { n: left })}
            </button>
            {tide.depth < max && (
              <button type="button" onClick={() => send({ type: "descend" })}>
                {t("water.descend", { n: tide.depth + 1 })}
              </button>
            )}
          </>
        )}
        {back}
        <Items when="map" />
      </main>
    );
  }

  if (room.resolved) {
    return (
      <main>
        <p className="kicker">{t(`room.${room.kind}`)}</p>
        <h2>{t("room.visited")}</h2>
        {tide.lastRoll && <Dice dice={tide.lastRoll} />}
        {back}
      </main>
    );
  }

  if (room.kind === "island") {
    const id = room.content as IslandId;
    return (
      <main>
        <Art src={bayArt.island[id]} alt={t(`island.${id}.text`)} />
        <p className="kicker">{t("room.island")}</p>
        <h2>{t(`island.${id}.text`)}</h2>
        <button type="button" className="primary" onClick={() => send({ type: "explore" })}>
          {t(`island.${id}.yes`)}
        </button>
        {back}
      </main>
    );
  }

  const prefix = room.kind === "wreck" ? "wreck" : "event";
  const id = room.content as WreckId | EventId;
  const art = room.kind === "wreck" ? bayArt.wreck[id as WreckId] : bayArt.event[id as EventId];
  return (
    <main>
      <Art src={art} alt={t(`${prefix}.${id}.text`)} />
      <p className="kicker">{t(`room.${room.kind}`)}</p>
      <h2>{t(`${prefix}.${id}.text`)}</h2>
      <button type="button" className="primary" onClick={() => send({ type: "decide", yes: true })}>
        {t(`${prefix}.${id}.yes`)}
      </button>
      <button type="button" onClick={() => send({ type: "decide", yes: false })}>
        {t(`${prefix}.${id}.no`)}
      </button>
    </main>
  );
}
