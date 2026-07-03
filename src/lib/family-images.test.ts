import { describe, it, expect } from 'vitest';
import {
  MAX_FAMILY_IMAGES, orderFamilyImages, addFamilyImage,
  removeFamilyImage, setPrimaryFamilyImage, moveFamilyImage,
} from './family-images';

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
