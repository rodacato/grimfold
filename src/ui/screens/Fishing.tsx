import { bayArt } from "../../content/bay/art";
import { chapterReady, creature, known, loot, requestWanting } from "../../domain/derived";
import { HOLD_SIZE, type Tide } from "../../domain/state";
import { seesHp, targetFor } from "../../domain/tide/fight";
import { t } from "../../i18n/t";
import { Art } from "../Art";
import { useGame } from "../game";
import { Dice, Items } from "../TideParts";

export function Bite() {
  const { game, send } = useGame();
  const bite = (game.tide as Tide).bite;
  if (!bite) return null;
  return (
    <main>
      <Art src={bayArt.cardBack(bite.shadow)} alt={t(`shadow.${bite.shadow}`)} className="card" />
      <h2>{t("bite.title", { shadow: t(`shadow.${bite.shadow}`) })}</h2>
      <button type="button" className="primary" onClick={() => send({ type: "pull" })}>
        {t("bite.pull")}
      </button>
      <button type="button" onClick={() => send({ type: "cut" })}>
        {t("bite.cut")}
      </button>
    </main>
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
      <main>
        <Art src={bayArt.creature(c.id)} alt={name} />
        <p className="kicker">{t("fight.unfishable")}</p>
        <h2>{name}</h2>
        <button type="button" onClick={() => send({ type: "endure", holdOn: false })}>
          {t("fight.endureCut")}
        </button>
        <button type="button" className="danger" onClick={() => send({ type: "endure", holdOn: true })}>
          {t("fight.endureHold")}
        </button>
      </main>
    );
  }

  return (
    <main>
      <Art src={bayArt.creature(c.id)} alt={name} />
      <p className="kicker">
        {fight.wanderer ? t("fight.wanderer") : t("fight.depth", { n: tide.depth })} ·{" "}
        {t(`rarity.${c.rarity}`)}
      </p>
      <h2>{name}</h2>
      <p>
        {seesHp(ctx, fight) ? t("fight.hp", { n: c.hp - fight.damage, max: c.hp }) : t("fight.hpUnknown")} ·{" "}
        {t("fight.line", { n: fight.line, max: fight.knots })} ·{" "}
        {t("fight.target", { n: targetFor(ctx, c, fight) })}
      </p>
      {fight.roll && (
        <p>
          <Dice dice={fight.roll.dice} /> <b>{fight.roll.total}</b>{" "}
          {fight.last && t(fight.last.key, fight.last.params)}
        </p>
      )}
      {!fight.roll && fight.last && <p>{t(fight.last.key, fight.last.params)}</p>}
      <button type="button" className="primary" onClick={() => send({ type: "roll" })}>
        {t("fight.roll")}
      </button>
      {fight.bleedable && !fight.bled && (
        <button type="button" className="danger" onClick={() => send({ type: "bleed" })}>
          {t("fight.bleed")}
        </button>
      )}
      <Items when="fight" />
      <button type="button" className="link" onClick={() => send({ type: "cut" })}>
        {fight.wanderer ? t("fight.rowAwayButton") : t("fight.cutLine")}
      </button>
    </main>
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

  return (
    <main>
      <article className="unfolded-card">
        <span className="d66">{c.d66}</span>
        <Art src={bayArt.creature(c.id)} alt={t(`creature.${c.id}`)} />
        <h2>{t(`creature.${c.id}`)}</h2>
        <p>
          {t("loot.hp", { n: c.hp })} · {t(`rarity.${c.rarity}`)}
        </p>
        <p>
          <b>{t(`loot.${item.id}`)}</b> — {item.use ? t(`use.${item.use}`) : t("use.none")}
        </p>
      </article>
      {forChapter && chapter && (
        <p className="hint">{t("loot.forChapter", { who: t(`person.${chapter.by}`) })}</p>
      )}
      {request && (
        <p className="hint">
          {t("loot.wanted", {
            who: t(`person.${request.by}`),
            gear: t(`gear.${request.gear}`),
            level: request.level,
          })}
        </p>
      )}
      {isKnown ? (
        <blockquote>
          {t(`creature.${c.id}.diary`)} — {t(`person.${c.diaryBy}`)}
        </blockquote>
      ) : (
        <button type="button" onClick={() => send({ type: "record" })}>
          {t("loot.record")}
        </button>
      )}
      <section>
        <h3>{t("loot.hold", { n: tide.hold.length, max: HOLD_SIZE })}</h3>
        <ul>
          {tide.hold.map((id, i) => (
            <li key={`${id}-${i}`}>
              {t(`loot.${id}`)}{" "}
              {full && (
                <button type="button" onClick={() => send({ type: "stow", choice: { to: "swap", drop: i } })}>
                  {t("loot.swap")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <button
        type="button"
        className="primary"
        disabled={full}
        onClick={() => send({ type: "stow", choice: { to: "hold" } })}
      >
        {t("loot.toHold")}
      </button>
      <button type="button" onClick={() => send({ type: "stow", choice: { to: "sea" } })}>
        {t("loot.toSea")}
      </button>
    </main>
  );
}
