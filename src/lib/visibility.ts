/**
 * Pure helpers for the admin Visibility tab: a per-category checklist with
 * one checkbox per size (products.code). Checkbox = NOT products.is_hidden.
 * Colocated tests in visibility.test.ts.
 */

/** Subset of a products row the checklist needs. */
export interface VisibilityRow {
  code: string;
  sub_category: string | null;
  family_code: string | null;
  configuration: string | null;
  size: string | null;
  sort_order: number;
  is_hidden: boolean;
}

export interface SizeNode { code: string; size: string | null; hidden: boolean; }

/** One site card (configuration = series + family code) with its sizes. */
export interface ConfigNode {
  key: string;                      // `${series}||${family_code ?? code}`
  series: string | null;
  familyCode: string | null;
  name: string;
  sizes: SizeNode[];
  visible: number;
  total: number;
}

export interface SeriesNode {
  series: string | null;
  configs: ConfigNode[];
  visible: number;
  total: number;
}

export type TriState = 'all' | 'none' | 'mixed';

// Blank series sort sentinel — a leading space can't occur in a real
// sub_category (they're btrim-checked by the data checker).
const NO_SERIES = ' none';

/** series → configuration (site card grain: sub_category + family_code) → sizes. */
export function buildVisibilityTree(rows: VisibilityRow[]): SeriesNode[] {
  const seriesMap = new Map<string, Map<string, VisibilityRow[]>>();
  for (const r of rows) {
    const s = r.sub_category ?? NO_SERIES;
    const cfg = `${r.sub_category ?? ''}||${r.family_code ?? r.code}`;
    const bySeries = seriesMap.get(s) ?? new Map<string, VisibilityRow[]>();
    const list = bySeries.get(cfg) ?? [];
    list.push(r);
    bySeries.set(cfg, list);
    seriesMap.set(s, bySeries);
  }
  const seriesKeys = [...seriesMap.keys()].sort((a, b) =>
    a === NO_SERIES ? 1 : b === NO_SERIES ? -1 : a.localeCompare(b));
  return seriesKeys.map((sk) => {
    const configs = [...seriesMap.get(sk)!.entries()].map(([key, list]) => {
      const sizes = [...list]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((r) => ({ code: r.code, size: r.size, hidden: r.is_hidden }));
      const visible = sizes.filter((s) => !s.hidden).length;
      const first = list[0];
      return {
        key,
        series: first.sub_category,
        familyCode: first.family_code,
        name: first.configuration ?? first.family_code ?? first.code,
        sizes,
        visible,
        total: sizes.length,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return {
      series: sk === NO_SERIES ? null : sk,
      configs,
      visible: configs.reduce((n, c) => n + c.visible, 0),
      total: configs.reduce((n, c) => n + c.total, 0),
    };
  });
}

export function triState(visible: number, total: number): TriState {
  if (total > 0 && visible === total) return 'all';
  if (visible === 0) return 'none';
  return 'mixed';
}

/** Every size code a card-level bulk toggle affects. */
export function codesForConfig(node: ConfigNode): string[] {
  return node.sizes.map((s) => s.code);
}

/** Every size code a series-level bulk toggle affects. */
export function codesForSeries(node: SeriesNode): string[] {
  return node.configs.flatMap(codesForConfig);
}

/** Case-insensitive match on code, configuration name, or size text. */
export function matchesQuery(row: VisibilityRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [row.code, row.configuration ?? '', row.size ?? '']
    .some((h) => h.toLowerCase().includes(needle));
}
