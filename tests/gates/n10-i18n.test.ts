import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SHOWN_ATTRIBUTES = new Set(["alt", "aria-label", "title", "placeholder"]);
const WORDS = /\p{L}{2,}/u;

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });

function hardcodedStrings(path: string, source = readFileSync(path, "utf8")): string[] {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && WORDS.test(node.text)) found.push(node.text.trim());
    if (
      ts.isJsxAttribute(node) &&
      SHOWN_ATTRIBUTES.has(node.name.getText()) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      WORDS.test(node.initializer.text)
    )
      found.push(node.initializer.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found.map((text) => `${path}: ${text}`);
}

describe("N10: every string the player reads comes from a locale file", () => {
  it("finds no text written into a screen", () => {
    expect(tsxFiles("src").flatMap((path) => hardcodedStrings(path))).toEqual([]);
  });

  it("catches a hardcoded label or alt text", () => {
    const screen = `export const A = () => <p aria-label="Volver">Hola mar <b>{t("x")}</b></p>;`;
    expect(hardcodedStrings("probe.tsx", screen)).toHaveLength(2);
  });
});
