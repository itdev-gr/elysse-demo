import { describe, it, expect } from 'vitest';
import { wrapSelection, prefixLines, makeLink } from './MarkdownEditor';

describe('wrapSelection', () => {
  it('wraps the selected text with the marker', () => {
    const r = wrapSelection('hello world', 0, 5, '**', 'bold text');
    expect(r.text).toBe('**hello** world');
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('hello');
  });

  it('inserts a placeholder when nothing is selected', () => {
    const r = wrapSelection('', 0, 0, '**', 'bold text');
    expect(r.text).toBe('**bold text**');
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('bold text');
  });

  it('unwraps when the selection is already wrapped', () => {
    const r = wrapSelection('**hello** world', 2, 7, '**', 'bold text');
    expect(r.text).toBe('hello world');
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('hello');
  });
});

describe('prefixLines', () => {
  const h2 = (t: string, s: number, e: number) =>
    prefixLines(t, s, e, () => '## ', /^## /, /^#{1,6}\s+/);
  const bullet = (t: string, s: number, e: number) =>
    prefixLines(t, s, e, () => '- ', /^- /, /^(?:[-*]|\d+\.)\s+/);
  const numbered = (t: string, s: number, e: number) =>
    prefixLines(t, s, e, (i) => `${i + 1}. `, /^\d+\. /, /^(?:[-*]|\d+\.)\s+/);

  it('prefixes the line containing the cursor', () => {
    expect(h2('Section title', 3, 3).text).toBe('## Section title');
  });

  it('replaces an existing heading level instead of stacking', () => {
    expect(h2('### Sub', 0, 0).text).toBe('## Sub');
  });

  it('toggles the prefix off when already applied', () => {
    expect(h2('## Section', 4, 4).text).toBe('Section');
  });

  it('prefixes every selected line for lists', () => {
    const text = 'one\ntwo\nthree';
    expect(bullet(text, 0, text.length).text).toBe('- one\n- two\n- three');
  });

  it('numbers lines sequentially', () => {
    const text = 'one\ntwo\nthree';
    expect(numbered(text, 0, text.length).text).toBe('1. one\n2. two\n3. three');
  });

  it('converts a bulleted list to a numbered one', () => {
    const text = '- one\n- two';
    expect(numbered(text, 0, text.length).text).toBe('1. one\n2. two');
  });

  it('only touches the selected lines', () => {
    const text = 'intro\nitem\noutro';
    const r = bullet(text, 6, 6);
    expect(r.text).toBe('intro\n- item\noutro');
  });
});

describe('makeLink', () => {
  it('uses the selection as the label and selects the URL placeholder', () => {
    const r = makeLink('visit our site', 6, 9);
    expect(r.text).toBe('visit [our](https://) site');
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('https://');
  });

  it('inserts a label placeholder when nothing is selected', () => {
    const r = makeLink('', 0, 0);
    expect(r.text).toBe('[link text](https://)');
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('https://');
  });
});
