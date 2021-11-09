import { Chroma } from '../deps.ts';

export type ColorTheme = {
  type?: string;
  colors?: Record<string, string>;
  tokenColors?: Array<TokenColor>;
  semanticHighlighting?: boolean;
}

export type BuildConfig = {
  sources: Record<string, string | ColorTheme>;
  combine: string[];
  remove?: Record<keyof ColorTheme, string[]>;
  greyify?: ColorThemeSelection
}

export type ColorThemeSelection = {values: string[], keys: string[]};

export type TokenColor = {
  name?: string;
  scope?: string | string[];
  settings?: Record<string, string>;
}

export function isTokenColor(obj: any): obj is TokenColor {
  return Object.keys(obj).some((key) => ['name', 'scope', 'settings'].includes(key));
}

export function isArray<T>(array: Array<T>): array is T[] {
  return Array.isArray(array);
}

export function isColorTheme(obj: any): obj is ColorTheme {
  return Object.keys(obj).every((key) => ['type','colors','tokenColors','semanticHighlighting'].includes(key));
}

export function hexToRgba(hex: string) {
  let result;
  if (hex.length == 4 || hex.length == 5) {
    result = /^#?([a-f\d]{3})([a-f\d]{1})*$/i.exec(hex);
  } else {
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})*$/i.exec(hex);
  }
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: parseInt(result[4] ?? 0, 16)/255,
  } : null;
}

export function desaturateHex(hex: string): string | undefined {
  const color = Chroma.color(hex);
  return color.desaturate(1).hex(color.alpha() == 1 ? 'rgb' : 'rgba');
}

export type KeyValueFunction = (key: string, value: any) => any;

export function map(object: any, fn: KeyValueFunction): any {
  return Object.fromEntries(Object
      .entries(object)
      .map(([k, v]) => [k, v && typeof v === 'object' ? map(v, (key, val) => fn(`${k}.${key}`, val)) : fn(k, v)])
      .map(([k, v]) => [k, v && typeof v === 'object' && Object.keys(v)[0] == '0' ? Object.values(v) : v])
  );
}