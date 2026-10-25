import { useState } from "react";
import { bayArt } from "../../content/bay/art";
import type { Creature } from "../../domain/content";
import { caught, known, loot } from "../../domain/derived";
import { baseTarget } from "../../domain/tide/fight";
import { t } from "../../i18n/t";
import { Art, LootIcon } from "../Art";
import { useGame } from "../game";
import { Horror } from "../Horror";
import { Btn, Screen, Waves } from "../Paper";

const goBack = () => {
  window.location.hash = "#/";
};

const where = (c: Creature) =>
  c.water ? `${t(`water.${c.water}`)} · ${t("fight.depth", { n: c.depth })}` : t("fight.wanderer");

function Entry({ c, isKnown }: { c: Creature; isKnown: boolean }) {
  const { game, place } = useGame();
  const item = loot(place, c.loot);
  const hp = isKnown
    ? t("loot.hp", { n: c.hp })
    : `${t("fight.hpUnknown")} · ${t(`bestiary.size.${c.shadow}`)}`;
  return (
    <div>
      <b>{t(`creature.${c.id}`)}</b>
      <small>
        {where(c)} · {c.unfishable ? t("fight.unfishable") : hp} · {t(`rarity.${c.rarity}`)}
      </small>
      {!c.unfishable && <small>{t("bestiary.target", { n: baseTarget(game, c) })}</small>}
      <small className="drops-loot named">
        <LootIcon id={item.id} />
        {t("bestiary.loot", { item: item.id })}
        {item.use && ` · ${t(`use.${item.use}`)}`}
      </small>
      {isKnown ? (
        <div className="diary">
          {t(`creature.${c.id}.diary`)}
          <cite>— {t(`person.${c.diaryBy}`)}</cite>
        </div>
      ) : (
        <p className="small voice">{t("bestiary.notRecorded")}</p>
      )}
    </div>
  );
}

function Sheet({ c, isKnown, onClose }: { c: Creature; isKnown: boolean; onClose: () => void }) {
  return (
    <Screen>
      <div className="scene showcase">
        <Waves />
        <Horror c={c} />
      </div>
      <section className="paper bestiary-sheet">
        <Entry c={c} isKnown={isKnown} />
      </section>
      <Btn onClick={onClose}>{t("bestiary.back")}</Btn>
    </Screen>
  );
}

export function Bestiary() {
  const { game, place } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const opened = place.creatures.find((c) => c.id === open);
  // In development every sheet opens, so new puppets can be checked without fishing them.
  const canOpen = (seen: boolean) => seen || import.meta.env.DEV;
  if (opened)
    return (
      <Sheet
        c={opened}
        isKnown={known(game, opened.id) || import.meta.env.DEV}
        onClose={() => setOpen(null)}
      />
    );

  return (
    <Screen>
      <section className="paper">
        <h2>{t("bestiary.title", { n: game.bestiary.length, of: place.creatures.length })}</h2>
        <p className="small">{t("bestiary.caught", { n: game.caught.length })}</p>
        <p className="small">{t("bestiary.tap")}</p>
      </section>
      <ul className="bestiary">
        {place.creatures.map((c) => {
          const isKnown = known(game, c.id);
          const seen = isKnown || caught(game, c.id);
          return (
            <li
              key={c.id}
              className={seen ? "" : "unknown"}
              {...(canOpen(seen) && {
                role: "button",
                tabIndex: 0,
                onClick: () => setOpen(c.id),
                onKeyDown: (e: { key: string }) => e.key === "Enter" && setOpen(c.id),
              })}
            >
              <Art src={bayArt.creature(c.id)} alt={seen ? t(`creature.${c.id}`) : "???"} className="thumb" />
              {seen ? (
                <Entry c={c} isKnown={isKnown} />
              ) : (
                <div>
                  <b>???</b>
                  <small>
                    {t("bite.title", { shadow: t(`shadow.${c.shadow}`) })} · {where(c)}
                  </small>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Btn onClick={goBack}>{t("nav.back")}</Btn>
    </Screen>
  );
}

export function Sessions() {
  const { game } = useGame();
  const rows = [...game.sessions].reverse();
  return (
    <Screen>
      <section className="paper">
        <h2>{t("sessions.title")}</h2>
        {rows.length === 0 ? (
          <p className="small">{t("sessions.empty")}</p>
        ) : (
          <table className="sessions">
            <thead>
              <tr>
                <th>{t("sessions.tide")}</th>
                <th>{t("sessions.end")}</th>
                <th>{t("sessions.minutes")}</th>
                <th>{t("sessions.rooms")}</th>
                <th>{t("sessions.sanity")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.campaign}-${s.tide}`}>
                  <td>
                    {s.campaign}·{s.tide}
                  </td>
                  <td>{t(`sessions.end.${s.end}`)}</td>
                  <td>{s.minutes}</td>
                  <td>{s.rooms}</td>
                  <td>{s.sanityLost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <div className="actions">
        <Btn onClick={() => navigator.clipboard?.writeText(JSON.stringify(game.sessions, null, 1))}>
          {t("sessions.copy")}
        </Btn>
        <Btn onClick={goBack}>{t("nav.back")}</Btn>
      </div>
    </Screen>
  );
}
