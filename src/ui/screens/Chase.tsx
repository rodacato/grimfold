import { useState } from "react";
import { bayArt } from "../../content/bay/art";
import { campaignMutations, sanityCeiling } from "../../domain/derived";
import { MAX_SCARS, type Tide } from "../../domain/state";
import { escapeTarget } from "../../domain/tide/lighthouse";
import { t } from "../../i18n/t";
import { ArponeraPuppet } from "../Arponera";
import { Art } from "../Art";
import { FaroleroPuppet, useFarolero } from "../Farolero";
import { useGame } from "../game";
import { Btn, Roll, Screen, Waves } from "../Paper";
import { Items } from "../TideParts";

export function FaroleroView() {
  const { game, ctx, send } = useGame();
  const encounter = (game.tide as Tide).encounter;
  const { stage, name } = useFarolero();
  return (
    <Screen>
      <div className="scene tall">
        <Waves />
        <div className="stage">
          <FaroleroPuppet
            pose="farolero-persigue"
            width={330}
            look={stage >= 3 ? "full" : stage === 2 ? "lured" : "shadow"}
          />
        </div>
      </div>
      <section className="paper dark">
        <p className="kicker">{t("lighthouse.boss")}</p>
        <h2>{t("farolero.caught", { farolero: name })}</h2>
        <p className="small">
          {t(game.tide?.light ? "farolero.rule.light" : "farolero.rule", { n: escapeTarget(ctx) })}
        </p>
        {encounter && (
          <Roll dice={encounter.dice} rollKey={game.rng} total={encounter.dice.reduce((a, b) => a + b, 0)}>
            {t(encounter.escapes ? "farolero.escaped" : "farolero.hit")}
          </Roll>
        )}
      </section>
      {encounter ? (
        <Btn kind="primary" onClick={() => send({ type: "afterEncounter" })}>
          {t("farolero.continue")}
        </Btn>
      ) : (
        <>
          <Btn kind="primary" onClick={() => send({ type: "flee" })}>
            {t("farolero.flee")}
          </Btn>
          <Items when="chase" />
        </>
      )}
    </Screen>
  );
}

export function TideEndView() {
  const { game, place, send } = useGame();
  const [dawn, setDawn] = useState(false);
  const tide = game.tide as Tide;
  const c = game.campaign;
  const how = tide.end ?? "dock";
  const toDock = () => send({ type: "backToDock" });
  if (dawn)
    return (
      <Screen>
        <div className="scene tall">
          <Art src={bayArt.lighthouse} alt={t("place.lighthouse")} />
        </div>
        <section className="paper">
          <p className="kicker">{t("end.dawn.kicker")}</p>
          <p>{t("end.dawn.text")}</p>
        </section>
        <Btn kind="primary" onClick={toDock}>
          {t("end.toDock")}
        </Btn>
      </Screen>
    );
  const lost = c.scars >= MAX_SCARS;
  const titleKey = how === "dock" ? (tide.light ? "end.dock.light" : "end.dock.dark") : `end.${how}`;
  const kept = [
    t("end.keeps.bestiary", {
      caught: game.caught.length,
      n: game.bestiary.length,
      of: place.creatures.length,
    }),
  ];
  const lostThings: string[] = [];
  if (lost) lostThings.push(t("end.loses.campaign"));
  else kept.push(t("end.keeps.gear"));
  if (how === "dock") {
    if (tide.light) kept.push(t("end.keeps.light"));
    if (tide.hold.length > 0) kept.push(t("end.keeps.shelf", { n: tide.hold.length }));
  } else {
    if (tide.light) lostThings.push(t("end.loses.light"));
    if (!lost && tide.hold.length > 0) lostThings.push(t("end.loses.hold", { n: tide.hold.length }));
  }
  if (how === "transformed" && !lost) {
    const latest = campaignMutations(c).at(-1);
    if (latest) kept.push(t("end.keeps.mutation", { mutation: t(`mutation.${latest}.short`) }));
    lostThings.push(t("end.loses.ceiling", { n: sanityCeiling(c) }));
  }
  const marked = how === "transformed" ? campaignMutations(c) : tide.mutations;
  return (
    <Screen>
      <div className="scene tall">
        {how === "dock" && <Art src={bayArt.boat} alt="" />}
        <div className="stage">
          <ArponeraPuppet mutations={marked} fromSea={how === "transformed" && lost} width={180} />
        </div>
      </div>
      <section className={`paper ${how === "dock" ? "amber" : "dark"}`}>
        <p className="kicker">{t("end.kicker", { n: tide.number })}</p>
        <h2>{t(titleKey)}</h2>
        <p>
          {how === "transformed"
            ? t(lost ? "end.transformed.lost" : "end.transformed.text", { n: c.scars, max: MAX_SCARS })
            : t(`${titleKey}.text`)}
        </p>
      </section>
      <section className="paper">
        <h3>{t("end.keeps")}</h3>
        <ul className="keeps">
          {kept.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
        {lostThings.length > 0 && (
          <>
            <h3>{t("end.loses")}</h3>
            <ul className="keeps lost">
              {lostThings.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </>
        )}
      </section>
      {how === "dock" && tide.light ? (
        <Btn kind="primary" onClick={() => setDawn(true)}>
          {t("end.next")}
        </Btn>
      ) : (
        <Btn kind="primary" onClick={toDock}>
          {t("end.toDock")}
        </Btn>
      )}
    </Screen>
  );
}
