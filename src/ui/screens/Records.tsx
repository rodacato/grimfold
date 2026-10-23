import { bayArt } from "../../content/bay/art";
import { known } from "../../domain/derived";
import { t } from "../../i18n/t";
import { Art } from "../Art";
import { useGame } from "../game";

export function Bestiary() {
  const { game, place } = useGame();
  return (
    <main>
      <h1>{t("bestiary.title", { n: game.bestiary.length, of: place.creatures.length })}</h1>
      <ul className="bestiary">
        {place.creatures.map((c) => {
          const where = c.water ? t(`water.${c.water}`) : t("fight.wanderer");
          return known(game, c.id) ? (
            <li key={c.id}>
              <Art src={bayArt.creature(c.id)} alt={t(`creature.${c.id}`)} className="thumb" />
              <b>{t(`creature.${c.id}`)}</b>
              <small>
                {where} · {c.unfishable ? t("fight.unfishable") : t("loot.hp", { n: c.hp })} ·{" "}
                {t(`rarity.${c.rarity}`)}
              </small>
              <blockquote>
                {t(`creature.${c.id}.diary`)} — {t(`person.${c.diaryBy}`)}
              </blockquote>
            </li>
          ) : (
            <li key={c.id} className="unknown">
              <b>???</b>
              <small>
                {t(`shadow.${c.shadow}`)} · {where}
              </small>
            </li>
          );
        })}
      </ul>
      <a href="#/">{t("nav.back")}</a>
    </main>
  );
}

export function Sessions() {
  const { game } = useGame();
  const rows = [...game.sessions].reverse();
  return (
    <main>
      <h1>{t("sessions.title")}</h1>
      {rows.length === 0 ? (
        <p>{t("sessions.empty")}</p>
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
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(JSON.stringify(game.sessions, null, 1))}
      >
        {t("sessions.copy")}
      </button>
      <a href="#/">{t("nav.back")}</a>
    </main>
  );
}
