import bay from "../content/bay/es-MX.json";
import ui from "./es-MX.json";

const strings: Record<string, string> = { ...ui, ...bay };

export type Params = Record<string, string | number>;

/** `item` params are loot ids, translated in place. */
export function t(key: string, params?: Params): string {
  const template = strings[key];
  if (template === undefined) {
    if (import.meta.env?.DEV) console.warn(`missing string ${key}`);
    return key;
  }
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined) return `{${name}}`;
    return name === "item" ? t(`loot.${value}`) : String(value);
  });
}

export const hasString = (key: string): boolean => key in strings;
