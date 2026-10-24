import { bayArt } from "../../content/bay/art";
import type { Creature } from "../../domain/content";
import { chapterReady, creature, known, loot, requestWanting } from "../../domain/derived";
import { HOLD_SIZE, type Tide } from "../../domain/state";
import { seesHp, targetFor } from "../../domain/tide/fight";
import { t } from "../../i18n/t";
import { Art, LootIcon } from "../Art";
import { useGame } from "../game";
import { Btn, Roll, Screen, Waves } from "../Paper";
import { Items } from "../TideParts";

const RARITY_GLYPH = ["○", "◐", "●", "✶"];

function WaterScene({ c, shadow = false }: { c: Creature; shadow?: boolean }) {
  return (
    <div className="scene">
      <Waves />
      {!c.unfishable && <div className="line" />}
      <Art
        src={bayArt.creature(c.id)}
        alt={shadow ? t(`shadow.${c.shadow}`) : t(`creature.${c.id}`)}
        className={`creature ${c.shadow} ${shadow ? "shadow" : ""}`}
      />
    </div>
  );
}

export function Bite() {
  const { game, place, send } = useGame();
  const tide = game.tide as Tide;
  const bite = tide.bite;
  if (!bite) return null;
  return (
    <Screen>
      <WaterScene c={creature(place, bite.creature)} shadow />
      <section className="paper">
        <p className="kicker">{t("fight.depth", { n: tide.depth })}</p>
        <h2>{t("bite.title", { shadow: t(`shadow.${bite.shadow}`) })}</h2>
      </section>
      <div className="actions two">
        <Btn kind="primary" onClick={() => send({ type: "pull" })}>
          {t("bite.pull")}
        </Btn>
        <Btn onClick={() => send({ type: "cut" })}>{t("bite.cut")}</Btn>
      </div>
    </Screen>
  );
}

export function FightView() {
  const { game, place, ctx, send } = useGame();
  const tide = game.tide as Tide;
  const fight = tide.fight;
  if (!fight) return null;
  const c = creature(place, fight.creature);
  const name = t(`creature.${c.id}`);

  if (c.unfishable) {
    return (
      <Screen>
        <WaterScene c={c} />
        <section className="paper dark">
          <p className="kicker">{t("fight.unfishable")}</p>
          <h2>{name}</h2>
          <p className="small voice">{t("fight.unfishable.voice")}</p>
        </section>
        <div className="actions">
          <Btn sub={t("fight.endureCut.sub")} onClick={() => send({ type: "endure", holdOn: false })}>
            {t("fight.endureCut")}
          </Btn>
          <Btn
            kind="danger"
            sub={t("fight.endureHold.sub")}
            onClick={() => send({ type: "endure", holdOn: true })}
          >
            {t("fight.endureHold")}
          </Btn>
        </div>
      </Screen>
    );
  }

  const left = c.hp - fight.damage;
  return (
    <Screen>
      <WaterScene c={c} />
      <section className="paper">
        <div className="versus">
          <div>
            <p className="kicker">
              {fight.wanderer ? t("fight.wanderer") : t("fight.depth", { n: tide.depth })} ·{" "}
              {t(`rarity.${c.rarity}`)}
            </p>
            <h2>{name}</h2>
          </div>
          {seesHp(ctx, fight) ? (
            <span className="foe-hp" role="img" aria-label={t("fight.hp", { n: left, max: c.hp })}>
              {Array.from({ length: c.hp }, (_, i) => (
                <i key={i} className={i < fight.damage ? "hit" : ""} />
              ))}
            </span>
          ) : (
            <span className="foe-hp">
              <b>{t("fight.hpUnknown")}</b>
            </span>
          )}
        </div>
        <div className="knots" role="img" aria-label={t("fight.line", { n: fight.line, max: fight.knots })}>
          {t("gear.sedal")}
          {Array.from({ length: fight.knots }, (_, i) => (
            <i key={i} className={i < fight.line ? "" : "snapped"} />
          ))}
          <span className="target">{t("fight.target", { n: targetFor(ctx, c, fight) })}</span>
        </div>
        {fight.roll ? (
          <Roll dice={fight.roll.dice} rollKey={game.rng} total={fight.roll.total}>
            {fight.last && t(fight.last.key, fight.last.params)}
          </Roll>
        ) : (
          fight.last && <p className="small">{t(fight.last.key, fight.last.params)}</p>
        )}
      </section>
      <div className="actions">
        <Btn kind="primary" onClick={() => send({ type: "roll" })}>
          {t("fight.roll")}
        </Btn>
        {fight.bleedable && !fight.bled && (
          <Btn kind="danger" sub={t("fight.bleed.sub")} onClick={() => send({ type: "bleed" })}>
            {t("fight.bleed")}
          </Btn>
        )}
      </div>
      <Items when="fight" />
      <button type="button" className="link" onClick={() => send({ type: "cut" })}>
        {fight.wanderer ? t("fight.rowAwayButton") : t("fight.cutLine")}
      </button>
    </Screen>
  );
}

export function LootView() {
  const { game, place, send } = useGame();
  const tide = game.tide as Tide;
  if (!tide.loot) return null;
  const c = creature(place, tide.loot.creature);
  const item = loot(place, c.loot);
  const full = tide.hold.length >= HOLD_SIZE;
  const chapter = place.chapters[game.campaign.chapter];
  const forChapter = chapter?.wants.includes(item.id) && !chapterReady(place, game.campaign);
  const request = requestWanting(place, game.campaign, item.id);
  const isKnown = known(game, c.id);
  const name = t(`creature.${c.id}`);

  return (
    <Screen>
      <div className="card" role="img" aria-label={name}>
        <div className="card-shadow" />
        <div className="fold f1">
          <div className="face">
            <span className="card-number">{c.d66}</span>
            <Art src={bayArt.creature(c.id)} alt="" />
          </div>
          <div className="face back" />
        </div>
        <div className="fold f2">
          <div className="face">
            <h2>{name}</h2>
            <p>
              <span>{t("loot.hp", { n: c.hp })}</span>
              <span>{t(`rarity.${c.rarity}`)}</span>
            </p>
          </div>
        </div>
        <div className="fold f3">
          <div className="face">
            <LootIcon id={item.id} big fallback={<span className="glyph">{RARITY_GLYPH[c.rarity]}</span>} />
            <div>
              <span className="kicker">{item.use ? t(`use.${item.use}`) : t("use.none")}</span>
              <b>{t(`loot.${item.id}`)}</b>
            </div>
          </div>
          <div className="face back" />
        </div>
      </div>

      {(forChapter || request) && (
        <ul className="notes">
          {forChapter && chapter && <li>{t("loot.forChapter", { who: t(`person.${chapter.by}`) })}</li>}
          {request && (
            <li>
              {t("loot.wanted", {
                who: t(`person.${request.by}`),
                gear: t(`gear.${request.gear}`),
                level: request.level,
              })}
            </li>
          )}
        </ul>
      )}

      {isKnown ? (
        <section className="paper">
          <div className="diary">
            {t(`creature.${c.id}.diary`)}
            <cite>— {t(`person.${c.diaryBy}`)}</cite>
          </div>
        </section>
      ) : (
        <Btn sub={t("loot.record.sub")} onClick={() => send({ type: "record" })}>
          {t("loot.record")}
        </Btn>
      )}

      <section className="paper">
        <h3>{t("loot.hold", { n: tide.hold.length, max: HOLD_SIZE })}</h3>
        <p className="small">{t("loot.fates")}</p>
        <ul className="hold">
          {Array.from({ length: HOLD_SIZE }, (_, i) => {
            const id = tide.hold[i];
            if (!id)
              return (
                <li key={`empty-${i}`} className="empty">
                  {t("loot.empty")}
                </li>
              );
            return (
              <li key={`${id}-${i}`}>
                <span className="named">
                  <LootIcon id={id} />
                  {t(`loot.${id}`)}
                </span>
                {full && (
                  <button
                    type="button"
                    onClick={() => send({ type: "stow", choice: { to: "swap", drop: i } })}
                  >
                    {t("loot.swap")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <div className="actions two">
        <Btn kind="primary" disabled={full} onClick={() => send({ type: "stow", choice: { to: "hold" } })}>
          {t("loot.toHold")}
        </Btn>
        <Btn onClick={() => send({ type: "stow", choice: { to: "sea" } })}>{t("loot.toSea")}</Btn>
      </div>
    </Screen>
  );
}
