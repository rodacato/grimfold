import { bayArt } from "../../content/bay/art";
import { canStartTide } from "../../domain/campaign";
import type { GearPiece } from "../../domain/content";
import {
  activeRequests,
  baitable,
  campaignLost,
  campaignMutations,
  chapterReady,
  creature,
  sanityCeiling,
  spareLoot,
} from "../../domain/derived";
import { HOLD_SIZE, MAX_SCARS } from "../../domain/state";
import { t } from "../../i18n/t";
import { ArponeraPuppet } from "../Arponera";
import { Art, LootIcon } from "../Art";
import { FaroleroPuppet } from "../Farolero";
import { useGame } from "../game";
import { Btn, Screen } from "../Paper";

const GEAR: GearPiece[] = ["cana", "sedal", "farol", "motor", "casco"];
const LEVELS = [1, 2, 3];

function Title() {
  return (
    <div className="title">
      <h1>
        {[..."GRIMFOLD"].map((letter, i) => (
          <span key={i}>{letter}</span>
        ))}
      </h1>
      <p>{t("dock.tagline")}</p>
    </div>
  );
}

export function Dock() {
  const { game, place, ctx, send } = useGame();
  const c = game.campaign;
  const newCampaign = (
    <Btn kind="primary" onClick={() => send({ type: "newCampaign" })}>
      {t("dock.newCampaign")}
    </Btn>
  );

  if (campaignLost(c)) {
    return (
      <Screen>
        <Title />
        <div className="scene tall">
          <div className="stage">
            <ArponeraPuppet mutations={[]} fromSea width={180} />
          </div>
        </div>
        <section className="paper dark">
          <p className="kicker">{t("dock.lost.kicker")}</p>
          <h2>{t("dock.lost.title")}</h2>
          <p>{t("dock.lost.text")}</p>
          <Summary />
        </section>
        {newCampaign}
      </Screen>
    );
  }
  if (c.ending === "choose") {
    return (
      <Screen>
        <div className="scene tall">
          <div className="stage">
            <FaroleroPuppet pose="farolero" width={300} />
          </div>
        </div>
        <section className="paper dark">
          <p className="kicker">{t("dock.ending.kicker")}</p>
          <h2>{t("dock.ending.title")}</h2>
          <p>{t("dock.ending.text")}</p>
        </section>
        <div className="actions">
          <Btn
            kind="primary"
            sub={t("dock.ending.faro.sub")}
            onClick={() => send({ type: "chooseEnding", ending: "faro" })}
          >
            {t("dock.ending.faro")}
          </Btn>
          <Btn
            kind="danger"
            sub={t("dock.ending.bajar.sub")}
            onClick={() => send({ type: "chooseEnding", ending: "bajar" })}
          >
            {t("dock.ending.bajar")}
          </Btn>
        </div>
      </Screen>
    );
  }
  if (c.ending) {
    return (
      <Screen>
        <Title />
        <div className="scene ending">
          <Art src={bayArt.ending[c.ending]} alt={t(`ending.${c.ending}.title`)} />
        </div>
        <section className={`paper ${c.ending === "faro" ? "amber" : "dark"}`}>
          <p className="kicker">{t("dock.end.kicker")}</p>
          <h2>{t(`ending.${c.ending}.title`)}</h2>
          <p>{t(`ending.${c.ending}.text`)}</p>
          <Summary />
        </section>
        {newCampaign}
      </Screen>
    );
  }

  const chapter = place.chapters[c.chapter];
  if (!chapter) return null;
  const ready = chapterReady(place, c);
  const piece = !c.chapterPiece && chapter.wants.find((w) => c.shelf.includes(w));
  const requests = activeRequests(place, c);
  const spare = spareLoot(place, c);
  const baits = baitable(place, c);
  const check = (done: boolean, text: string) => (
    <li className={done ? "done" : ""}>
      {done ? "✓" : "○"} {text}
    </li>
  );

  return (
    <Screen>
      <div className={`town ${c.tides > 0 ? "compact" : ""}`}>
        <div className="panels">
          {bayArt.town.map((src) => (
            <Art key={src} src={src} alt={t("dock.town")} />
          ))}
        </div>
        <Title />
      </div>

      <section className="paper dark chapter">
        <Art src={bayArt.person(chapter.by)} alt={t(`person.${chapter.by}`)} className="portrait" />
        <div>
          <p className="kicker">
            {t("dock.chapter", { n: c.chapter + 1, of: place.chapters.length })} ·{" "}
            {t(`chapter.${chapter.id}.title`)}
          </p>
          <p className="quote">“{t(`chapter.${chapter.id}.says`)}”</p>
          <cite>— {t(`person.${chapter.by}`)}</cite>
        </div>
        <ul className="todo full">
          {check(c.chapterLight, t("dock.needsLight"))}
          {chapter.wants.length > 0 &&
            check(c.chapterPiece, chapter.wants.map((w) => t(`loot.${w}`)).join(t("dock.or")))}
        </ul>
        {!ready && <p className="small full voice">{t(`chapter.${chapter.id}.hint`)}</p>}
        {piece && (
          <div className="full">
            <Btn
              kind="primary"
              sub={t("dock.givePiece.sub")}
              onClick={() => send({ type: "giveChapterPiece" })}
            >
              {t("dock.givePiece", { item: piece })}
            </Btn>
          </div>
        )}
      </section>

      {ready && (
        <>
          <section className="paper amber">
            <p className="kicker">{t("dock.reveals")}</p>
            <p className="quote">{t(`chapter.${chapter.id}.reveals`)}</p>
          </section>
          <Btn kind="primary" onClick={() => send({ type: "nextChapter" })}>
            {c.chapter < place.chapters.length - 1 ? t("dock.nextChapter") : t("dock.toEnding")}
          </Btn>
        </>
      )}

      <section className="paper">
        <h3>{t("dock.requests")}</h3>
        <div className="requests">
          {requests.length === 0 && <p className="small voice">{t("dock.noRequests")}</p>}
          {requests.map((r) => {
            const has = c.shelf.includes(r.wants);
            return (
              <div key={r.id} className={`request ${has ? "ready" : ""}`}>
                <span className="request-icon">
                  <LootIcon id={r.wants} big />
                </span>
                <div>
                  <b>{t("dock.request", { who: t(`person.${r.by}`), item: r.wants })}</b>
                  <small className="named gives">
                    <Art src={bayArt.gear(r.gear, r.level)} alt="" className="gear-icon" />
                    <span>
                      {t("dock.requestGives", { gear: t(`gear.${r.gear}`), level: r.level })}:{" "}
                      {t(`gear.${r.gear}.${r.level}`)}
                    </span>
                  </small>
                  {has && <small className="voice">“{t(`request.${r.id}`)}”</small>}
                </div>
                {has && (
                  <button type="button" onClick={() => send({ type: "deliverRequest", request: r.id })}>
                    {t("dock.deliver")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {c.shelf.length > 0 && <p className="kicker">{t("dock.shelfTitle")}</p>}
        {c.shelf.length > 0 && (
          <div className="shelf">
            {c.shelf.map((s, i) => (
              <button
                type="button"
                key={`${s}-${i}`}
                className="named"
                disabled={c.packed.length >= HOLD_SIZE}
                onClick={() => send({ type: "pack", item: s, aboard: true })}
              >
                <LootIcon id={s} />
                {t(`loot.${s}`)}
              </button>
            ))}
          </div>
        )}
        {c.packed.length > 0 && <p className="kicker">{t("dock.packedTitle")}</p>}
        {c.packed.length > 0 && (
          <div className="shelf packed">
            {c.packed.map((s, i) => (
              <button
                type="button"
                key={`${s}-${i}`}
                className="named"
                onClick={() => send({ type: "pack", item: s, aboard: false })}
              >
                <LootIcon id={s} />
                {t(`loot.${s}`)}
              </button>
            ))}
          </div>
        )}
      </section>

      {c.bait && (
        <section className="paper">
          <h3>{t("dock.bait")}</h3>
          <p className="small">
            {t("dock.bait.set", {
              item: creature(place, c.bait).loot,
              water: t(`water.${creature(place, c.bait).water}`),
              depth: creature(place, c.bait).depth,
            })}
          </p>
        </section>
      )}
      {!c.bait && spare >= 0 && baits.length > 0 && (
        <details className="paper bait">
          <summary>
            <h3>{t("dock.bait")}</h3>
            <span className="small">{t("dock.bait.summary", { item: c.shelf[spare] as string })}</span>
          </summary>
          <p className="small">{t("dock.bait.how")}</p>
          <ul className="bait-options">
            {baits.map((cr) => (
              <li key={cr.id}>
                <button type="button" onClick={() => send({ type: "setBait", creature: cr.id })}>
                  <b>{t(`loot.${cr.loot}`)}</b>
                  <small>{t("dock.bait.where", { water: t(`water.${cr.water}`), depth: cr.depth })}</small>
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <section className="paper dark crew">
        <ArponeraPuppet mutations={campaignMutations(c)} width={104} />
        <div>
          <h3>{t("arponera.name")}</h3>
          {c.scars > 0 ? (
            <p className="small">
              <b>{t("dock.scars", { n: c.scars, max: MAX_SCARS, sanity: sanityCeiling(c) })}</b>{" "}
              {campaignMutations(c)
                .map((m) => t(`mutation.${m}.short`))
                .join(" ")}
            </p>
          ) : (
            <p className="small voice">{t("dock.noScars")}</p>
          )}
        </div>
      </section>

      <section className="paper">
        <h3>{t("dock.gear")}</h3>
        <div className="gear">
          {GEAR.map((g) => (
            <div key={g}>
              <Art src={bayArt.gear(g, c.gear[g])} alt="" className="gear-icon" />
              <b>{t(`gear.${g}`)}</b>
              <span className="levels" role="img" aria-label={`${c.gear[g]}/3`}>
                {LEVELS.map((n) => (
                  <i key={n} className={n <= c.gear[g] ? "on" : ""} />
                ))}
              </span>
              <span>{t(`gear.${g}.${c.gear[g]}`)}</span>
            </div>
          ))}
        </div>
      </section>

      {canStartTide(ctx) && (
        <div className="go">
          <Btn
            kind="primary"
            sub={t("dock.descend.sub", { sanity: sanityCeiling(c) + c.solace })}
            onClick={() => send({ type: "startTide" })}
          >
            {t("dock.descend")}
          </Btn>
        </div>
      )}

      <nav className="footer-nav">
        <a href="#/bestiario">{t("nav.bestiary")}</a> · <a href="#/registro">{t("nav.sessions")}</a> ·{" "}
        <a href="#/imprimir">{t("nav.print")}</a>
      </nav>
    </Screen>
  );
}

function Summary() {
  const { game, place } = useGame();
  const c = game.campaign;
  return (
    <p className="small">
      {t("dock.summary", {
        tides: c.tides,
        bestiary: game.bestiary.length,
        of: place.creatures.length,
        requests: c.requestsDone.length,
        scars: c.scars,
      })}
    </p>
  );
}
