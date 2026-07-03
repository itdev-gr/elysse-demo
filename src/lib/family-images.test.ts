import { describe, it, expect } from 'vitest';
import {
  MAX_FAMILY_IMAGES, orderFamilyImages, addFamilyImage,
  removeFamilyImage, setPrimaryFamilyImage, moveFamilyImage,
} from './family-images';
import { groupImagesByFamily, imagesByCode, type FamilyImageRow } from './family-images';

describe('orderFamilyImages', () => {
  it('sorts by sort_order, primary (lowest) first', () => {
    expect(orderFamilyImages([
      { url: 'c', sort_order: 2 }, { url: 'a', sort_order: 0 }, { url: 'b', sort_order: 1 },
    ])).toEqual(['a', 'b', 'c']);
  });
});

describe('addFamilyImage', () => {
  it('appends a new url', () => {
    expect(addFamilyImage(['a'], 'b')).toEqual(['a', 'b']);
  });
  it('is a no-op when the url is already present', () => {
    expect(addFamilyImage(['a', 'b'], 'a')).toEqual(['a', 'b']);
  });
  it('is a no-op once MAX_FAMILY_IMAGES is reached', () => {
    const full = ['a', 'b', 'c', 'd', 'e'];
    expect(full).toHaveLength(MAX_FAMILY_IMAGES);
    expect(addFamilyImage(full, 'f')).toEqual(full);
  });
});

describe('removeFamilyImage', () => {
  it('removes the url at the index', () => {
    expect(removeFamilyImage(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
  it('is a no-op for an out-of-range index', () => {
    expect(removeFamilyImage(['a'], 5)).toEqual(['a']);
  });
});

describe('setPrimaryFamilyImage', () => {
  it('moves the chosen image to the front, others keep order', () => {
    expect(setPrimaryFamilyImage(['a', 'b', 'c'], 2)).toEqual(['c', 'a', 'b']);
  });
  it('is a no-op when it is already primary', () => {
    expect(setPrimaryFamilyImage(['a', 'b'], 0)).toEqual(['a', 'b']);
  });
});

describe('moveFamilyImage', () => {
  it('moves an image one step left', () => {
    expect(moveFamilyImage(['a', 'b', 'c'], 2, 'left')).toEqual(['a', 'c', 'b']);
  });
  it('moves an image one step right', () => {
    expect(moveFamilyImage(['a', 'b', 'c'], 0, 'right')).toEqual(['b', 'a', 'c']);
  });
  it('clamps at the edges (no-op)', () => {
    expect(moveFamilyImage(['a', 'b'], 0, 'left')).toEqual(['a', 'b']);
    expect(moveFamilyImage(['a', 'b'], 1, 'right')).toEqual(['a', 'b']);
  });
});

describe('groupImagesByFamily', () => {
  const rows: FamilyImageRow[] = [
    { id: '1', family_id: 'F1', url: 'a', sort_order: 1 },
    { id: '2', family_id: 'F1', url: 'p', sort_order: 0 },
    { id: '3', family_id: 'F2', url: 'x', sort_order: 0 },
  ];
  it('groups by family_id with primary first', () => {
    const m = groupImagesByFamily(rows);
    expect(m.get('F1')).toEqual(['p', 'a']);
    expect(m.get('F2')).toEqual(['x']);
  });
});

describe('imagesByCode', () => {
  it('re-keys a family_id→urls map to code→urls', () => {
    const byId = new Map<string, string[]>([['F1', ['p', 'a']], ['F2', ['x']]]);
    const fams = [{ id: 'F1', code: '382B' }, { id: 'F2', code: '380C' }];
    const byCode = imagesByCode(fams, byId);
    expect(byCode.get('382B')).toEqual(['p', 'a']);
    expect(byCode.get('380C')).toEqual(['x']);
  });
  it('omits families that have no images', () => {
    const byCode = imagesByCode([{ id: 'F3', code: '999' }], new Map());
    expect(byCode.has('999')).toBe(false);
  });
});
