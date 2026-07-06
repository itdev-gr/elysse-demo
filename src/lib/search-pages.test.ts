import { describe, it, expect } from 'vitest';
import { blockText, sectionText, buildPagesIndex } from './search-pages';

describe('blockText', () => {
  it('extracts heading and paragraph text', () => {
    expect(blockText({ kind: 'heading', level: 2, text: 'Who we are' })).toEqual(['Who we are']);
    expect(blockText({ kind: 'paragraph', text: 'Body copy.' })).toEqual(['Body copy.']);
  });
  it('extracts list items and callout title+body', () => {
    expect(blockText({ kind: 'list', items: ['a', 'b'] })).toEqual(['a', 'b']);
    expect(blockText({ kind: 'callout', title: 'T', body: 'B' })).toEqual(['T', 'B']);
  });
  it('extracts pillars intro, titles and bodies', () => {
    expect(blockText({ kind: 'pillars', intro: 'I', items: [{ number: 1, title: 'T', body: 'B' }] }))
      .toEqual(['I', 'T', 'B']);
  });
  it('returns only present copy for image blocks', () => {
    expect(blockText({ kind: 'image', src: '/x.jpg', alt: 'x' })).toEqual(['']);
  });
});

describe('sectionText', () => {
  it('extracts text-section heading and body', () => {
    expect(sectionText({ kind: 'text', heading: 'H', body: 'B' })).toEqual(['', 'H', 'B']);
  });
  it('extracts list-section items', () => {
    expect(sectionText({ kind: 'list', items: ['x'] })).toEqual(['', '', 'x']);
  });
});

describe('buildPagesIndex', () => {
  const index = buildPagesIndex();

  it('indexes the corporate profile page with its body text', () => {
    const e = index.find((x) => x.path === '/about-us/');
    expect(e).toBeDefined();
    expect(e!.title).toBe('Corporate Profile');
    expect(e!.section).toBe('About Us');
    expect(e!.text).toContain('Elysée manufactures and supplies piping');
  });

  it('indexes services pages from the legacy content registry', () => {
    const e = index.find((x) => x.path === '/our-services/agriculture/');
    expect(e).toBeDefined();
    expect(e!.title).toBe('Agriculture');
  });

  it('indexes innovation insight articles and funded projects by slug', () => {
    expect(index.some((x) => x.path.startsWith('/innovation/insights/') && x.path.length > '/innovation/insights/'.length)).toBe(true);
    expect(index.some((x) => x.path.startsWith('/innovation/funded-research-projects/') && x.path.length > '/innovation/funded-research-projects/'.length)).toBe(true);
  });

  it('includes manual entries for listing pages', () => {
    expect(index.some((x) => x.path === '/insights/news/')).toBe(true);
    expect(index.some((x) => x.path === '/products/catalogues/')).toBe(true);
    expect(index.some((x) => x.path === '/about-us/quality-certifications/pe-pipes/')).toBe(true);
  });

  it('uses normalized paths (leading + trailing slash)', () => {
    for (const e of index) expect(e.path).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });

  it('has no duplicate paths and no empty haystacks', () => {
    expect(new Set(index.map((e) => e.path)).size).toBe(index.length);
    for (const e of index) expect(e.text.length).toBeGreaterThan(0);
  });

  it('only sets Greek fields when a translation exists', () => {
    for (const e of index) {
      if (e.titleEl !== undefined) expect(e.titleEl.trim().length).toBeGreaterThan(0);
      if (e.textEl !== undefined) expect(e.textEl.trim().length).toBeGreaterThan(0);
    }
  });
});
