import { describe, it, expect } from 'vitest';
import { mergeFamilyCodes, buildCodeFacts, filterFamilies, type ProductFactRow, type ProductFamily, type CodeFacts } from './families';

describe('mergeFamilyCodes', () => {
  it('unions product-derived and managed codes', () => {
    expect(mergeFamilyCodes(['330', '331'], ['330T', '332'])).toEqual(['330', '330T', '331', '332']);
  });
  it('de-duplicates codes present in both lists', () => {
    expect(mergeFamilyCodes(['330', '330A'], ['330', '330B'])).toEqual(['330', '330A', '330B']);
  });
  it('drops null and empty entries', () => {
    expect(mergeFamilyCodes(['330', null, ''], [null, '331'])).toEqual(['330', '331']);
  });
  it('returns [] when nothing is supplied', () => {
    expect(mergeFamilyCodes([], [])).toEqual([]);
  });
  it('sorts lexicographically so letter variants follow their number', () => {
    expect(mergeFamilyCodes(['332B', '330', '331A'], ['330A'])).toEqual(['330', '330A', '331A', '332B']);
  });
});

describe('buildCodeFacts', () => {
  const rows = (rs: Partial<ProductFactRow>[]): ProductFactRow[] =>
    rs.map((r) => ({
      code: r.code ?? 'X', category_name: r.category_name ?? 'Compression Fittings',
      sub_category: r.sub_category ?? null, family_code: r.family_code ?? null,
      configuration: r.configuration ?? null,
    }));

  it('lists every series a family has products in — not just the first', () => {
    // 382B has SKUs in BOTH series (the A/M/Z code suffix encodes the series).
    // Ordered by code, the Zeta "…A" row comes first — the old logic filed the
    // whole family under Zeta only. It must appear under both.
    const { facts } = buildCodeFacts(rows([
      { code: '382B02001A', family_code: '382B', sub_category: 'ζ - Zeta Series PN 16 bar' },
      { code: '382B02001M', family_code: '382B', sub_category: 'έ - Epsilon Series PN 16 bar' },
      { code: '382B02001Z', family_code: '382B', sub_category: 'ζ - Zeta Series PN 16 bar' },
    ]));
    const f = facts['Compression Fittings|382B'];
    expect(f.series).toEqual(['ζ - Zeta Series PN 16 bar', 'έ - Epsilon Series PN 16 bar']);
  });

  it('counts products per series, not just in total', () => {
    const { facts } = buildCodeFacts(rows([
      { code: '382B02001A', family_code: '382B', sub_category: 'ζ - Zeta Series PN 16 bar' },
      { code: '382B02001M', family_code: '382B', sub_category: 'έ - Epsilon Series PN 16 bar' },
      { code: '382B02001Z', family_code: '382B', sub_category: 'ζ - Zeta Series PN 16 bar' },
    ]));
    const f = facts['Compression Fittings|382B'];
    expect(f.count).toBe(3);                                              // total across series
    expect(f.perSeries.get('έ - Epsilon Series PN 16 bar')?.count).toBe(1);
    expect(f.perSeries.get('ζ - Zeta Series PN 16 bar')?.count).toBe(2);
  });

  it('keeps the first non-empty configuration name per series', () => {
    const { facts } = buildCodeFacts(rows([
      { code: '382B02001A', family_code: '382B', sub_category: 'ζ - Zeta Series PN 16 bar', configuration: 'Zeta coupling' },
      { code: '382B02001M', family_code: '382B', sub_category: 'έ - Epsilon Series PN 16 bar', configuration: 'Epsilon coupling' },
    ]));
    const f = facts['Compression Fittings|382B'];
    expect(f.perSeries.get('έ - Epsilon Series PN 16 bar')?.configuration).toBe('Epsilon coupling');
    expect(f.perSeries.get('ζ - Zeta Series PN 16 bar')?.configuration).toBe('Zeta coupling');
  });

  it('collects the product codes per family and skips rows lacking a family code', () => {
    const { facts, codesByFam } = buildCodeFacts(rows([
      { code: '330001M', family_code: '330', sub_category: 'A' },
      { code: '330002M', family_code: '330', sub_category: 'A' },
      { code: 'ORPHAN', family_code: null, sub_category: 'A' },
    ]));
    expect(codesByFam['Compression Fittings|330']).toEqual(['330001M', '330002M']);
    expect(facts['Compression Fittings|330'].series).toEqual(['A']);
    expect(Object.keys(facts)).toEqual(['Compression Fittings|330']);     // orphan skipped
  });
});

describe('filterFamilies', () => {
  const fam = (code: string): ProductFamily =>
    ({ id: code, category_slug: 'compression', code, sort_order: 0, is_active: true });
  const facts = (configuration: string | null, perSeries: [string, string | null][] = []): CodeFacts => ({
    count: 1,
    configuration,
    series: perSeries.map(([s]) => s),
    perSeries: new Map(perSeries.map(([s, c]) => [s, { count: 1, configuration: c }])),
  });
  const factsByCode: Record<string, CodeFacts> = {
    '330': facts('Male Adaptor'),
    '330T': facts(null, [['Zeta', 'Tee Connector']]),
    '382B': facts('Elbow', [['Zeta', 'Elbow'], ['Epsilon', 'Reducing Elbow']]),
  };
  const fams = [fam('330'), fam('330T'), fam('382B')];
  const factsFor = (f: ProductFamily) => factsByCode[f.code];

  it('returns everything for an empty query', () => {
    expect(filterFamilies(fams, '', factsFor)).toEqual(fams);
  });
  it('matches by family code (case-insensitive)', () => {
    expect(filterFamilies(fams, '330t', factsFor).map((f) => f.code)).toEqual(['330T']);
  });
  it('a bare-number query matches every code containing it', () => {
    expect(filterFamilies(fams, '330', factsFor).map((f) => f.code)).toEqual(['330', '330T']);
  });
  it('matches by the overall configuration name', () => {
    expect(filterFamilies(fams, 'male adaptor', factsFor).map((f) => f.code)).toEqual(['330']);
  });
  it('matches by a per-series configuration name', () => {
    expect(filterFamilies(fams, 'reducing', factsFor).map((f) => f.code)).toEqual(['382B']);
  });
  it('returns [] when nothing matches', () => {
    expect(filterFamilies(fams, 'zzz', factsFor)).toEqual([]);
  });
});
