import { type Browser, type BrowserContext, chromium, type Page } from "playwright";
import { type PreviewServer, preview } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { t } from "../../src/i18n/t";

const URL = "http://localhost:4174/grimfold/";
let server: PreviewServer;
let browser: Browser;
let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  server = await preview({ preview: { port: 4174, strictPort: true } });
  browser = await chromium.launch();
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
});

afterAll(async () => {
  await browser?.close();
  await new Promise<void>((resolve) => server?.httpServer.close(() => resolve()));
});

describe("the installed app, without a network", () => {
  it("opens the Muelle with its own typefaces", async () => {
    await page.goto(URL);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    const external: string[] = [];
    context.on("request", (r) => {
      if (!r.url().startsWith("http://localhost:4174/")) external.push(r.url());
    });
    await context.setOffline(true);
    await page.reload();
    await expect.poll(() => page.getByText(t("dock.requests")).isVisible()).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => [
      document.fonts.check('24px "Bowlby One"', "BAJAR"),
      document.fonts.check('500 16px "Alegreya Sans"', "Muelle"),
      document.fonts.check('800 16px "Alegreya Sans"', "Muelle"),
    ]);
    expect(fonts).toEqual([true, true, true]);
    expect(external).toEqual([]);
  });
});
