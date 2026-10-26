import { type Browser, chromium, type Page } from "playwright";
import { type PreviewServer, preview } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import type { Command } from "../../src/domain/actions";
import type { Game, Room } from "../../src/domain/state";
import { castsLeft } from "../../src/domain/tide/sea";
import { t } from "../../src/i18n/t";
import { nextCommand } from "../support/bot";

let server: PreviewServer;
let browser: Browser;
let page: Page;
const errors: string[] = [];

const game = (): Promise<Game> =>
  page.evaluate(() => (window as never as { grimfold: { getGame(): Game } }).grimfold.getGame());
const button = (text: string | RegExp) => page.getByRole("button", { name: text }).first();
const startsWith = (key: string) => new RegExp(`^${t(key).split(/[ —(]/)[0]}`);

/** Clicks the button a person would press for the bot's command. */
async function press(command: Command): Promise<void> {
  switch (command.type) {
    case "startTide":
      return button(/^BAJAR/).click();
    case "navigate":
      if ((await game()).tide?.phase === "room") await button(t("room.back")).click();
      await page.locator(`g[data-room="${command.room}"]`).click();
      return button(t("map.sail")).click();
    case "openMap":
      return button(t("room.back")).click();
    case "stayHere":
      return button(t("map.stay")).click();
    case "descend":
      return button(/^Más hondo/).click();
    case "cast":
      return button(/^LANZAR/).click();
    case "pull":
      return button(t("bite.pull")).click();
    case "cut":
      return button(t("bite.cut")).click();
    case "roll":
    case "flee":
      return button(t("fight.roll")).click();
    case "bleed":
      return button(startsWith("fight.bleed")).click();
    case "endure":
      return button(t(command.holdOn ? "fight.endureHold" : "fight.endureCut")).click();
    case "record":
      return button(/^Anotar/).click();
    case "stow":
      return button(t(command.choice.to === "hold" ? "loot.toHold" : "loot.toSea")).click();
    case "decide":
      return page
        .locator(command.yes ? "main button.primary" : "main button:not(.primary)")
        .first()
        .click();
    case "explore":
      return page.locator("main button.primary").first().click();
    case "stealLight":
      return button(/^ROBAR LA LUZ/).click();
    case "afterEncounter":
      return button(t("farolero.continue")).click();
    case "backToDock":
      if ((await game()).tide?.light) await button(t("end.next")).click();
      return button(t("end.toDock")).click();
    case "deliverRequest":
      return button(t("dock.deliver")).click();
    case "giveChapterPiece":
      return button(/^Dar /).click();
    case "nextChapter":
      return page
        .locator("main button.primary, main button")
        .filter({ hasText: /SIGUIENTE|EL FINAL/ })
        .first()
        .click();
    case "chooseEnding":
      return button(/^PRENDER EL FARO/).click();
    default:
      throw new Error(`no UI for ${command.type}`);
  }
}

/** The bot, but it fishes the first water it finds, so the walk always shows a fight. */
function demoCommand(g: Game, fished: boolean): Command | null {
  const tide = g.tide;
  const room = tide?.rooms[tide.room] as Room | undefined;
  if (tide && !fished && !tide.light && room?.kind === "water" && castsLeft(room) > 0) {
    if (tide.phase === "map") return { type: "stayHere" };
    if (tide.phase === "room") return { type: "cast" };
  }
  return nextCommand(g, bay);
}

beforeAll(async () => {
  server = await preview({ preview: { port: 4173, strictPort: true } });
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("http://localhost:4173/grimfold/?semilla=42");
});

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((resolve) => server?.httpServer.close(() => resolve()));
});

describe("the demo, walked in a phone-sized browser", () => {
  const seen = new Set<string>();
  let reloadedMidTide = false;

  it("1–5: from the Muelle, out to sea, a fight, the Luz and back, ending the Marea", async () => {
    await expect.poll(() => page.getByText(t("dock.requests")).isVisible()).toBe(true);
    seen.add("dock");
    let fished = false;
    for (let step = 0; step < 400; step++) {
      const g = await game();
      if (g.tide) seen.add(g.tide.phase);
      if (g.tide?.phase === "loot") fished = true;
      if (g.tide?.phase === "end" && seen.has("fight")) break;

      if (g.tide?.phase === "fight" && !reloadedMidTide) {
        await page.reload();
        await expect.poll(() => button(t("fight.roll")).isVisible()).toBe(true);
        expect(await game()).toEqual(g);
        reloadedMidTide = true;
      }

      const command = demoCommand(g, fished);
      if (!command) break;
      await press(command);
    }
    for (const phase of ["dock", "map", "room", "bite", "fight", "end"]) expect(seen, phase).toContain(phase);
    await expect.poll(() => page.getByText(t("end.keeps"), { exact: true }).isVisible()).toBe(true);
  });

  it("6: a reload mid-Marea restored the exact state", () => {
    expect(reloadedMidTide).toBe(true);
  });

  it("7: the Hoja de marea prints the whole Mazo", async () => {
    await page.goto("http://localhost:4173/grimfold/#/imprimir");
    await expect.poll(() => page.locator("tr[data-d66]").count()).toBe(bay.creatures.length);
  });

  it("raised no errors in the browser", () => {
    expect(errors).toEqual([]);
  });
});
