import { describe, expect, it } from 'vitest';
import { slugify, calcReadingMinutes, renderPostBody } from './posts';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('strips diacritics', () => {
    expect(slugify('Élysée Group')).toBe('elysee-group');
  });
  it('strips punctuation and collapses dashes', () => {
    expect(slugify('Foo! @bar -- baz?')).toBe('foo-bar-baz');
  });
  it('trims leading and trailing dashes', () => {
    expect(slugify('  - Hello -  ')).toBe('hello');
  });
  it('handles empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('calcReadingMinutes', () => {
  it('returns 1 for empty', () => {
    expect(calcReadingMinutes('')).toBe(1);
  });
  it('returns 1 for short text', () => {
    expect(calcReadingMinutes('one two three')).toBe(1);
  });
  it('returns 1 for exactly 200 words', () => {
    const body = Array(200).fill('word').join(' ');
    expect(calcReadingMinutes(body)).toBe(1);
  });
  it('returns 2 for 201 words', () => {
    const body = Array(201).fill('word').join(' ');
    expect(calcReadingMinutes(body)).toBe(2);
  });
  it('returns 5 for 1000 words', () => {
    const body = Array(1000).fill('word').join(' ');
    expect(calcReadingMinutes(body)).toBe(5);
  });
});

describe('renderPostBody', () => {
  it('renders h2 and h3 headings', () => {
    const html = renderPostBody('## Section\n\n### Subsection');
    expect(html).toContain('<h2>Section</h2>');
    expect(html).toContain('<h3>Subsection</h3>');
  });
  it('renders blockquotes', () => {
    const html = renderPostBody('> Quoted text');
    expect(html).toContain('<blockquote>');
  });
  it('strips script tags', () => {
    const html = renderPostBody('hi <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
  it('adds rel and target to anchors', () => {
    const html = renderPostBody('[link](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
  it('keeps images served from our Supabase Storage', () => {
    const src = 'https://hsamhykaqmiiheneonxz.supabase.co/storage/v1/object/public/blog-covers/blog/x/y.png';
    const html = renderPostBody(`![alt](${src})`);
    expect(html).toContain(`src="${src}"`);
    expect(html).toContain('loading="lazy"');
  });
  it('drops images hot-linked from the source site', () => {
    const html = renderPostBody('![alt](https://elysee.com.cy/image/large/249/x.png)');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('elysee.com.cy');
  });
  it('unwraps links pointing back at the source site', () => {
    const html = renderPostBody('[catalogue](https://elysee.com.cy/catalogues)');
    expect(html).toContain('catalogue');
    expect(html).not.toContain('href="https://elysee.com.cy/catalogues"');
    expect(html).not.toContain('elysee.com.cy');
  });
});
