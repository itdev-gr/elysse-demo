import { supabase } from './supabase';
import { configSlug } from './product-configurations';

export interface AffectedProductRow {
  sub_category: string | null;
  family_code: string | null;
  code: string;
}
export type RenameSpec =
  | { kind: 'family'; from: string; to: string }
  | { kind: 'sub'; from: string; to: string };

export interface SlugRemap { from: string; to: string }

/** Pure: from the products affected by a rename, compute old->new config_slug pairs. */
export function planConfigSlugRemap(rows: AffectedProductRow[], spec: RenameSpec): SlugRemap[] {
  const seen = new Set<string>();
  const out: SlugRemap[] = [];
  for (const r of rows) {
    const ref = r.family_code ?? r.code;
    let oldSub = r.sub_category;
    let oldRef = ref;
    let newSub = r.sub_category;
    let newRef = ref;
    if (spec.kind === 'family') {
      if (ref !== spec.from) continue;     // only rows whose ref is the renamed family
      newRef = spec.to;
    } else {
      if ((r.sub_category ?? '') !== spec.from) continue;
      oldSub = spec.from;
      newSub = spec.to;
    }
    const from = configSlug(oldSub, oldRef);
    const to = configSlug(newSub, newRef);
    if (from === to || seen.has(from)) continue;
    seen.add(from);
    out.push({ from, to });
  }
  return out;
}

/** Apply the remap to product_configurations for one category. Returns an error message or null. */
export async function applyConfigSlugRemap(categorySlug: string, plan: SlugRemap[]): Promise<string | null> {
  for (const { from, to } of plan) {
    const { error } = await supabase.from('product_configurations')
      .update({ config_slug: to })
      .eq('category_slug', categorySlug)
      .eq('config_slug', from);
    if (error) return error.message;
  }
  return null;
}
