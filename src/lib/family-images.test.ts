import { describe, it, expect } from 'vitest';
import {
  MAX_FAMILY_IMAGES, orderFamilyImages, addFamilyImage,
  removeFamilyImage, setPrimaryFamilyImage, moveFamilyImage, setFamilyImageSeries,
  groupImagesByFamily, imagesByCode, resolveSeriesImages,
  type FamilyImageRow, type FamilyImageEntry,
} from './family-images';

const e = (url: string, series: string | null = null): FamilyImageEntry => ({ url, series });

describe('orderFamilyImages', () => {
  it('sorts by sort_order, primary (lowest) first, keeping series tags', () => {
    expect(orderFamilyImages([
      { url: 'c', series: 'Zeta', sort_order: 2 },
      { url: 'a', series: null, sort_order: 0 },
      { url: 'b', series: null, sort_order: 1 },
    ])).toEqual([e('a'), e('b'), e('c', 'Zeta')]);
  });
});

describe('addFamilyImage', () => {
  it('appends a new url untagged', () => {
    expect(addFamilyImage([e('a')], 'b')).toEqual([e('a'), e('b')]);
  });
  it('is a no-op when the url is already present (any tag)', () => {
    expect(addFamilyImage([e('a', 'Zeta'), e('b')], 'a')).toEqual([e('a', 'Zeta'), e('b')]);
  });
  it('is a no-op once MAX_FAMILY_IMAGES is reached', () => {
    const full = ['a', 'b', 'c', 'd', 'e'].map((u) => e(u));
    expect(full).toHaveLength(MAX_FAMILY_IMAGES);
    expect(addFamilyImage(full, 'f')).toEqual(full);
  });
});

describe('removeFamilyImage', () => {
  it('removes the entry at the index', () => {
    expect(removeFamilyImage([e('a'), e('b'), e('c')], 1)).toEqual([e('a'), e('c')]);
  });
  it('is a no-op for an out-of-range index', () => {
    expect(removeFamilyImage([e('a')], 5)).toEqual([e('a')]);
  });
});

describe('setPrimaryFamilyImage', () => {
  it('moves the chosen image to the front, others keep order', () => {
    expect(setPrimaryFamilyImage([e('a'), e('b'), e('c')], 2)).toEqual([e('c'), e('a'), e('b')]);
  });
  it('is a no-op when it is already primary', () => {
    expect(setPrimaryFamilyImage([e('a'), e('b')], 0)).toEqual([e('a'), e('b')]);
  });
});

describe('moveFamilyImage', () => {
  it('moves an image one step left', () => {
    expect(moveFamilyImage([e('a'), e('b'), e('c')], 2, 'left')).toEqual([e('a'), e('c'), e('b')]);
  });
  it('moves an image one step right', () => {
    expect(moveFamilyImage([e('a'), e('b'), e('c')], 0, 'right')).toEqual([e('b'), e('a'), e('c')]);
  });
  it('clamps at the edges (no-op)', () => {
    expect(moveFamilyImage([e('a'), e('b')], 0, 'left')).toEqual([e('a'), e('b')]);
    expect(moveFamilyImage([e('a'), e('b')], 1, 'right')).toEqual([e('a'), e('b')]);
  });
});

describe('setFamilyImageSeries', () => {
  it('tags the entry at the index', () => {
    expect(setFamilyImageSeries([e('a'), e('b')], 1, 'ζ - Zeta Series PN 16 bar'))
      .toEqual([e('a'), e('b', 'ζ - Zeta Series PN 16 bar')]);
  });
  it('clears the tag for empty/null values', () => {
    expect(setFamilyImageSeries([e('a', 'Zeta')], 0, null)).toEqual([e('a')]);
    expect(setFamilyImageSeries([e('a', 'Zeta')], 0, '  ')).toEqual([e('a')]);
  });
  it('is a no-op for an out-of-range index', () => {
    expect(setFamilyImageSeries([e('a')], 3, 'Zeta')).toEqual([e('a')]);
  });
});

describe('groupImagesByFamily', () => {
  const rows: FamilyImageRow[] = [
    { id: '1', family_id: 'F1', url: 'a', series: null, sort_order: 1 },
    { id: '2', family_id: 'F1', url: 'p', series: 'Zeta', sort_order: 0 },
    { id: '3', family_id: 'F2', url: 'x', series: null, sort_order: 0 },
  ];
  it('groups by family_id with primary first', () => {
    const m = groupImagesByFamily(rows);
    expect(m.get('F1')).toEqual([e('p', 'Zeta'), e('a')]);
    expect(m.get('F2')).toEqual([e('x')]);
  });
});

describe('imagesByCode', () => {
  it('re-keys a family_id→entries map to code→entries', () => {
    const byId = new Map<string, FamilyImageEntry[]>([
      ['F1', [e('p'), e('a')]], ['F2', [e('x')]],
    ]);
    const fams = [{ id: 'F1', code: '382B' }, { id: 'F2', code: '380C' }];
    const byCode = imagesByCode(fams, byId);
    expect(byCode.get('382B')).toEqual([e('p'), e('a')]);
    expect(byCode.get('380C')).toEqual([e('x')]);
  });
  it('omits families that have no images', () => {
    const byCode = imagesByCode([{ id: 'F3', code: '999' }], new Map());
    expect(byCode.has('999')).toBe(false);
  });
});

describe('resolveSeriesImages', () => {
  const zeta = 'ζ - Zeta Series PN 16 bar';
  const eps = 'έ - Epsilon Series PN 16 bar';
  it('returns tagged-for-series first, then untagged, de-duplicated', () => {
    const entries = [e('general1'), e('zeta1', zeta), e('eps1', eps), e('general2')];
    expect(resolveSeriesImages(entries, zeta)).toEqual(['zeta1', 'general1', 'general2']);
    expect(resolveSeriesImages(entries, eps)).toEqual(['eps1', 'general1', 'general2']);
  });
  it('returns only untagged images for an unknown or null series', () => {
    const entries = [e('general1'), e('zeta1', zeta)];
    expect(resolveSeriesImages(entries, 'Other Series')).toEqual(['general1']);
    expect(resolveSeriesImages(entries, null)).toEqual(['general1']);
  });
  it('falls back to the whole gallery when nothing matches (all tagged for other series)', () => {
    const entries = [e('zeta1', zeta), e('zeta2', zeta)];
    expect(resolveSeriesImages(entries, eps)).toEqual(['zeta1', 'zeta2']);
  });
  it('de-duplicates a url that is both tagged and untagged', () => {
    const entries = [e('same', zeta), e('same'), e('other')];
    expect(resolveSeriesImages(entries, zeta)).toEqual(['same', 'other']);
  });
  it('returns [] for an empty or missing gallery', () => {
    expect(resolveSeriesImages(undefined, zeta)).toEqual([]);
    expect(resolveSeriesImages([], zeta)).toEqual([]);
  });
});
