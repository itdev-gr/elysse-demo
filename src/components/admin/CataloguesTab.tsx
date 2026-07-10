import { Fragment, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Catalogue } from '../../types/catalogue';
import { buildCatalogueTree, filterCatalogueTree } from '../../lib/catalogues';
import { nextSortOrder } from '../../lib/certifications';
import CatalogueForm from './CatalogueForm';
import SearchInput from './SearchInput';

type Mode =
  | { kind: 'list' }
  | { kind: 'create'; parentId: string | null }
  | { kind: 'edit'; catalogue: Catalogue };

export default function CataloguesTab() {
  const [rows, setRows] = useState<Catalogue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('catalogues')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setRows((data ?? []) as Catalogue[]);
  };

  useEffect(() => {
    load();
  }, []);

  const tree = useMemo(() => buildCatalogueTree(rows ?? []), [rows]);
  const shownTree = useMemo(() => filterCatalogueTree(tree, query), [tree, query]);
  const categories = useMemo(() => (rows ?? []).filter((r) => !r.parent_id), [rows]);

  const toggleActive = async (cat: Catalogue) => {
    const { error: err } = await supabase
      .from('catalogues')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (cat: Catalogue) => {
    const isCategory = !cat.parent_id;
    const msg = isCategory
      ? `Delete category "${cat.name}" and ALL its subcategories? This cannot be undone.`
      : `Delete "${cat.name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    const { error: err } = await supabase.from('catalogues').delete().eq('id', cat.id);
    if (err) return setError(err.message);
    await load();
  };

  const siblingSort = (parentId: string | null) =>
    nextSortOrder((rows ?? []).filter((r) => (r.parent_id ?? null) === parentId));

  const statusChip = (active: boolean) =>
    active
      ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
      : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70';

  const actions = (cat: Catalogue) => (
    <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
      {!cat.parent_id && (
        <button
          onClick={() => setMode({ kind: 'create', parentId: cat.id })}
          className="text-brand-700 hover:text-brand-500 cursor-pointer"
        >
          + Sub
        </button>
      )}
      <button onClick={() => setMode({ kind: 'edit', catalogue: cat })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
        Edit
      </button>
      <button onClick={() => toggleActive(cat)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
        {cat.is_active ? 'Hide' : 'Show'}
      </button>
      <button onClick={() => remove(cat)} className="text-red-600 hover:text-red-800 cursor-pointer">
        Delete
      </button>
    </div>
  );

  const pdfSlotCell = (cat: Catalogue, slot: 'black' | 'blue') => {
    const url = slot === 'black' ? cat.pdf_url_black : cat.pdf_url_blue;
    const groups = ((slot === 'black' ? cat.groups_black : cat.groups_blue) ?? []) as string[];
    if (!url) return <span className="text-ink/40">—</span>;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer"
        >
          View ↗
        </a>
        {groups.length > 0 && (
          <span className="flex gap-0.5">
            {groups.map((g) => (
              <span key={g} className="inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] bg-ink/8 text-ink/70 rounded">{g}</span>
            ))}
          </span>
        )}
      </div>
    );
  };

  const unlinkedChip = (cat: Catalogue) => {
    const isCategory = !cat.parent_id;
    const linked = isCategory ? !!cat.category_slug : !!cat.product_sub_category;
    if (linked) return null;
    return (
      <span className="inline-block ml-2 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] bg-amber-100 text-amber-800 rounded">
        unlinked
      </span>
    );
  };

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-ink/60">
              Categories and their subcategories — each can carry a downloadable PDF.
            </p>
            <button
              type="button"
              onClick={() => setMode({ kind: 'create', parentId: null })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New category
            </button>
          </div>

          <div className="mb-6">
            <SearchInput value={query} onChange={setQuery} placeholder="Search category or subcategory…" />
          </div>

          {rows === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : tree.length === 0 ? (
            <p className="text-sm text-ink/60">No catalogues yet. Create the first category.</p>
          ) : shownTree.length === 0 ? (
            <p className="text-sm text-ink/60">Nothing matches &ldquo;{query}&rdquo;.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Black</th>
                    <th className="px-4 py-3">Blue</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shownTree.map((cat) => (
                    <Fragment key={cat.id}>
                      <tr className="border-b border-ink/5 bg-surface-alt/40">
                        <td className="px-4 py-3 text-ink/60">{cat.sort_order}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-ink">{cat.name}{unlinkedChip(cat)}</span>
                          {cat.description && (
                            <span className="block text-[11px] text-ink/55">{cat.description}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{pdfSlotCell(cat, 'black')}</td>
                        <td className="px-4 py-3">{pdfSlotCell(cat, 'blue')}</td>
                        <td className="px-4 py-3">
                          <span className={statusChip(cat.is_active)}>{cat.is_active ? 'Live' : 'Hidden'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">{actions(cat)}</td>
                      </tr>
                      {cat.children.map((sub) => (
                        <tr key={sub.id} className="border-b border-ink/5 last:border-b-0">
                          <td className="px-4 py-3 text-ink/45">{sub.sort_order}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-start gap-2 pl-5">
                              <span aria-hidden="true" className="text-ink/35">↳</span>
                              <span>
                                <span className="text-ink">{sub.name}{unlinkedChip(sub)}</span>
                                {sub.description && (
                                  <span className="block text-[11px] text-ink/55">{sub.description}</span>
                                )}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">{pdfSlotCell(sub, 'black')}</td>
                          <td className="px-4 py-3">{pdfSlotCell(sub, 'blue')}</td>
                          <td className="px-4 py-3">
                            <span className={statusChip(sub.is_active)}>{sub.is_active ? 'Live' : 'Hidden'}</span>
                          </td>
                          <td className="px-4 py-3 text-right">{actions(sub)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <CatalogueForm
          categories={categories}
          defaultParentId={mode.parentId}
          initialSortOrder={siblingSort(mode.parentId)}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <CatalogueForm
          categories={categories}
          initialSortOrder={mode.catalogue.sort_order}
          initial={mode.catalogue}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
