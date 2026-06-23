import { describe, it, expect } from 'vitest';
import { planConfigSlugRemap } from './remap-config-slugs';

// Each affected product contributes a (sub_category, ref) pair, where
// ref = family_code ?? code. The planner returns old->new config_slug pairs.
it('remaps slugs when the family code changes', () => {
  const rows = [
    { sub_category: 'Epsilon Series PN 16 bar', family_code: '330', code: '330' },
    { sub_category: 'Epsilon Series PN 16 bar', family_code: '331', code: '331' },
  ];
  const plan = planConfigSlugRemap(rows, { kind: 'family', from: '330', to: '330X' });
  expect(plan).toEqual([
    { from: 'epsilon-series-pn-16-bar-330', to: 'epsilon-series-pn-16-bar-330x' },
  ]);
});

it('remaps slugs when the sub_category changes', () => {
  const rows = [
    { sub_category: 'Old Series', family_code: '330', code: '330' },
    { sub_category: 'Old Series', family_code: null, code: '999' },
  ];
  const plan = planConfigSlugRemap(rows, { kind: 'sub', from: 'Old Series', to: 'New Series' });
  expect(plan).toEqual([
    { from: 'old-series-330', to: 'new-series-330' },
    { from: 'old-series-999', to: 'new-series-999' },
  ]);
});

it('ignores rows the rename does not touch and de-dupes', () => {
  const rows = [
    { sub_category: 'A', family_code: '1', code: '1' },
    { sub_category: 'A', family_code: '1', code: '1' },
    { sub_category: 'B', family_code: '2', code: '2' },
  ];
  const plan = planConfigSlugRemap(rows, { kind: 'family', from: '1', to: '1b' });
  expect(plan).toEqual([{ from: 'a-1', to: 'a-1b' }]);
});
