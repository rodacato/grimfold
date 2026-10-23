import { bayArt } from "../../content/bay/art";
import { campaignMutations, sanityCeiling } from "../../domain/derived";
import { MAX_SCARS, type Tide } from "../../domain/state";
import { escapeTarget } from "../../domain/tide/lighthouse";
import { t } from "../../i18n/t";
import { Art } from "../Art";
import { useGame } from "../game";
import { Dice, Items } from "../TideParts";

export function FaroleroView() {
  const { game, ctx, send } = useGame();
  const encounter = (game.tide as Tide).encounter;
  return (
    <main>
      <Art src={bayArt.farolero} alt={t("farolero.name")} />
      <p className="kicker">{t("lighthouse.boss")}</p>
      <h2>{t("farolero.caught")}</h2>
      <p>{t("farolero.rule", { n: escapeTarget(ctx) })}</p>
      {encounter ? (
        <>
          <p>
            <Dice dice={encounter.dice} /> <b>{encounter.dice.reduce((a, b) => a + b, 0)}</b>{" "}
            {t(encounter.escapes ? "farolero.escaped" : "farolero.hit")}
          </p>
          <button type="button" className="primary" onClick={() => send({ type: "afterEncounter" })}>
            {t("farolero.continue")}
          </button>
        </>
      ) : (
        <>
          <button type="button" className="primary" onClick={() => send({ type: "flee" })}>
            {t("farolero.flee")}
          </button>
          <Items when="chase" />
        </>
      )}
    </main>
  );
}

export function TideEndView() {
  const { game, place, send } = useGame();
  const tide = game.tide as Tide;
  const c = game.campaign;
  const how = tide.end ?? "dock";
  const lost = c.scars >= MAX_SCARS;
  const titleKey = how === "dock" ? (tide.light ? "end.dock.light" : "end.dock.dark") : `end.${how}`;
  const kept = [
    t("end.keeps.bestiary", { n: game.bestiary.length, of: place.creatures.length }),
    t("end.keeps.gear"),
    how === "dock" ? t("end.keeps.shelf", { n: tide.hold.length }) : t("end.keeps.holdLost"),
  ];
  if (how === "transformed" && !lost) {
    const latest = campaignMutations(c).at(-1);
    if (latest) kept.push(t("end.keeps.mutation", { mutation: t(`mutation.${latest}`) }));
    kept.push(t("end.keeps.ceiling", { n: sanityCeiling(c) }));
  }
  return (
    <main>
      <Art src={how === "dock" ? bayArt.boat : null} alt={t(titleKey)} />
      <p className="kicker">{t("end.kicker", { n: tide.number })}</p>
      <h2>{t(titleKey)}</h2>
      <p>
        {how === "transformed"
          ? t(lost ? "end.transformed.lost" : "end.transformed.text", { n: c.scars, max: MAX_SCARS })
          : t(`${titleKey}.text`)}
      </p>
      <section>
        <h3>{t("end.keeps")}</h3>
        <ul>
          {kept.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </section>
      <button type="button" className="primary" onClick={() => send({ type: "backToDock" })}>
        {t("end.toDock")}
      </button>
    </main>
  );
}
