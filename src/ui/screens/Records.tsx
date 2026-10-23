import { bayArt } from "../../content/bay/art";
import { known } from "../../domain/derived";
import { t } from "../../i18n/t";
import { Art } from "../Art";
import { useGame } from "../game";
import { Btn, Screen } from "../Paper";

const goBack = () => {
  window.location.hash = "#/";
};

export function Bestiary() {
  const { game, place } = useGame();
  return (
    <Screen>
      <section className="paper">
        <h2>{t("bestiary.title", { n: game.bestiary.length, of: place.creatures.length })}</h2>
      </section>
      <ul className="bestiary">
        {place.creatures.map((c) => {
          const where = c.water ? t(`water.${c.water}`) : t("fight.wanderer");
          const isKnown = known(game, c.id);
          return (
            <li key={c.id} className={isKnown ? "" : "unknown"}>
              <Art
                src={bayArt.creature(c.id)}
                alt={isKnown ? t(`creature.${c.id}`) : "???"}
                className="thumb"
              />
              {isKnown ? (
                <div>
                  <b>{t(`creature.${c.id}`)}</b>
                  <small>
                    {where} · {c.unfishable ? t("fight.unfishable") : t("loot.hp", { n: c.hp })} ·{" "}
                    {t(`rarity.${c.rarity}`)}
                  </small>
                  <div className="diary">
                    {t(`creature.${c.id}.diary`)}
                    <cite>— {t(`person.${c.diaryBy}`)}</cite>
                  </div>
                </div>
              ) : (
                <div>
                  <b>???</b>
                  <small>
                    {t("bite.title", { shadow: t(`shadow.${c.shadow}`) })} · {where}
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
