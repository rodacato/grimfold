import { bayArt } from "../../content/bay/art";
import { canStartTide } from "../../domain/campaign";
import type { GearPiece } from "../../domain/content";
import {
  activeRequests,
  campaignLost,
  campaignMutations,
  chapterReady,
  sanityCeiling,
} from "../../domain/derived";
import { MAX_SCARS } from "../../domain/state";
import { t } from "../../i18n/t";
import { Art } from "../Art";
import { useGame } from "../game";

const GEAR: GearPiece[] = ["cana", "sedal", "farol", "motor", "casco"];

export function Dock() {
  const { game, place, ctx, send } = useGame();
  const c = game.campaign;

  if (campaignLost(c)) {
    return (
      <main>
        <h1>{t("dock.lost.title")}</h1>
        <p>{t("dock.lost.text")}</p>
        <Summary />
        <button type="button" onClick={() => send({ type: "newCampaign" })}>
          {t("dock.newCampaign")}
        </button>
      </main>
    );
  }
  if (c.ending === "choose") {
    return (
      <main>
        <Art src={bayArt.farolero} alt={t("farolero.name")} />
        <h1>{t("dock.ending.title")}</h1>
        <p>{t("dock.ending.text")}</p>
        <button type="button" onClick={() => send({ type: "chooseEnding", ending: "faro" })}>
          {t("dock.ending.faro")}
        </button>
        <button type="button" onClick={() => send({ type: "chooseEnding", ending: "bajar" })}>
          {t("dock.ending.bajar")}
        </button>
      </main>
    );
  }
  if (c.ending) {
    return (
      <main>
        <h1>{t(`ending.${c.ending}.title`)}</h1>
        <p>{t(`ending.${c.ending}.text`)}</p>
        <Summary />
        <button type="button" onClick={() => send({ type: "newCampaign" })}>
          {t("dock.newCampaign")}
        </button>
      </main>
    );
  }

  const chapter = place.chapters[c.chapter];
  if (!chapter) return null;
  const ready = chapterReady(place, c);
  const piece = !c.chapterPiece && chapter.wants.find((w) => c.shelf.includes(w));
  const requests = activeRequests(place, c).slice(0, 3);

  return (
    <main>
      <div className="panorama">
        {bayArt.town.map((src) => (
          <Art key={src} src={src} alt={t("dock.town")} className="panel" />
        ))}
      </div>

      <section>
        <p className="kicker">
          {t("dock.chapter", { n: c.chapter + 1, of: place.chapters.length })} ·{" "}
          {t(`chapter.${chapter.id}.title`)}
        </p>
        <Art src={bayArt.person(chapter.by)} alt={t(`person.${chapter.by}`)} className="portrait" />
        <blockquote>
          “{t(`chapter.${chapter.id}.says`)}” — {t(`person.${chapter.by}`)}
        </blockquote>
        <ul>
          <li>
            {c.chapterLight ? "✓" : "○"} {t("dock.needsLight")}
          </li>
          {chapter.wants.length > 0 && (
            <li>
              {c.chapterPiece ? "✓" : "○"} {chapter.wants.map((w) => t(`loot.${w}`)).join(t("dock.or"))}
            </li>
          )}
        </ul>
        {!ready && <p className="hint">{t(`chapter.${chapter.id}.hint`)}</p>}
        {piece && (
          <button type="button" onClick={() => send({ type: "giveChapterPiece" })}>
            {t("dock.givePiece", { item: piece })}
          </button>
        )}
      </section>

      {ready && (
        <section>
          <h2>{t("dock.reveals")}</h2>
          <p>{t(`chapter.${chapter.id}.reveals`)}</p>
          <button type="button" onClick={() => send({ type: "nextChapter" })}>
            {c.chapter < place.chapters.length - 1 ? t("dock.nextChapter") : t("dock.toEnding")}
          </button>
        </section>
      )}

      <section>
        <h2>{t("dock.requests")}</h2>
        {requests.length === 0 && <p>{t("dock.noRequests")}</p>}
        {requests.map((r) => {
          const has = c.shelf.includes(r.wants);
          return (
            <div key={r.id} className="request">
              <b>{t("dock.request", { who: t(`person.${r.by}`), item: r.wants })}</b>
              <small>{t("dock.requestGives", { gear: t(`gear.${r.gear}`), level: r.level })}</small>
              {has && (
                <>
                  <q>{t(`request.${r.id}`)}</q>
                  <button type="button" onClick={() => send({ type: "deliverRequest", request: r.id })}>
                    {t("dock.deliver")}
                  </button>
                </>
              )}
            </div>
          );
        })}
        {c.shelf.length > 0 && (
          <p>{t("dock.shelf", { items: c.shelf.map((s) => t(`loot.${s}`)).join(", ") })}</p>
        )}
      </section>

      <section>
        <h2>{t("dock.gear")}</h2>
        <ul>
          {GEAR.map((piece) => (
            <li key={piece}>
              {t(`gear.${piece}`)} {c.gear[piece]}/3 — {t(`gear.${piece}.${c.gear[piece]}`)}
            </li>
          ))}
        </ul>
        {c.scars > 0 && (
          <p>
            {t("dock.scars", { n: c.scars, max: MAX_SCARS, sanity: sanityCeiling(c) })}{" "}
            {campaignMutations(c)
              .map((m) => t(`mutation.${m}`))
              .join(" · ")}
          </p>
        )}
      </section>

      {canStartTide(ctx) && (
        <button type="button" className="primary" onClick={() => send({ type: "startTide" })}>
          {t("dock.descend", { sanity: sanityCeiling(c) })}
        </button>
      )}

      <nav>
        <a href="#/bestiario">{t("nav.bestiary")}</a> · <a href="#/registro">{t("nav.sessions")}</a> ·{" "}
        <a href="#/imprimir">{t("nav.print")}</a>
      </nav>
    </main>
  );
}

function Summary() {
  const { game, place } = useGame();
  const c = game.campaign;
  return (
    <p>
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
