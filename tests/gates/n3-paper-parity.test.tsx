import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { bay } from "../../src/content/bay";
import { t } from "../../src/i18n/t";
import { isD66 } from "../../src/print/d66";
import { TideSheet } from "../../src/print/Sheets";

const rowsOf = (html: string) =>
  [...html.matchAll(/<tr data-d66="(\d+)">(.*?)<\/tr>/g)].map((m) => ({
    d66: Number(m[1]),
    html: m[2] ?? "",
  }));

describe("N3b: the Hoja de marea carries the same Mazo as the app", () => {
  const rows = rowsOf(renderToStaticMarkup(<TideSheet place={bay} />));

  it("has exactly one row per Carta", () => {
    expect(rows.length).toBe(bay.creatures.length);
    expect(new Set(rows.map((r) => r.d66)).size).toBe(rows.length);
  });

  it("numbers every row with a d66 a pair of dice can roll", () => {
    expect(rows.filter((r) => !isD66(r.d66))).toEqual([]);
  });

  it("shows each Carta's name, Vida and Botín as the app does", () => {
    for (const c of bay.creatures) {
      const row = rows.find((r) => r.d66 === c.d66);
      expect(row?.html, c.id).toContain(t(`creature.${c.id}`));
      expect(row?.html, c.id).toContain(t(`loot.${c.loot}`));
      if (!c.unfishable) expect(row?.html, c.id).toContain(`<td>${c.hp}</td>`);
    }
  });
});
