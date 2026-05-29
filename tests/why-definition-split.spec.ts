import { describe, it, expect } from 'vitest';
import { splitIntoLines } from '../src/components/innovation/why/splitLines';

describe('splitIntoLines', () => {
  it('keeps a single short sentence as one line', () => {
    expect(splitIntoLines('Innovation matters.')).toEqual(['Innovation matters.']);
  });
  it('splits on sentence boundaries', () => {
    const result = splitIntoLines('First sentence. Second sentence!');
    expect(result).toEqual(['First sentence.', 'Second sentence!']);
  });
  it('groups very short fragments with their neighbour', () => {
    const result = splitIntoLines('A. B. This is a longer sentence.');
    expect(result.length).toBeLessThan(3);
    expect(result.join(' ')).toBe('A. B. This is a longer sentence.');
  });
});
