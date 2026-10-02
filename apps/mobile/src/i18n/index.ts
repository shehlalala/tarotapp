/**
 * Minimal translation helper. Phase 4 replaces the internals with a full i18n
 * library; keys and the {{var}} interpolation syntax stay the same, so
 * components do not change.
 */
import en from './en.json';

type Vars = Record<string, string | number>;

function lookup(key: string): string | undefined {
  let node: unknown = en;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

export function t(key: string, vars?: Vars): string {
  const template = lookup(key);
  if (template === undefined) {
    if (__DEV__) console.warn(`i18n: missing key "${key}"`);
    return key;
  }
  return vars ? template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? '')) : template;
}
