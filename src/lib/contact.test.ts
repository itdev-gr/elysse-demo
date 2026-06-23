import { describe, it, expect } from 'vitest';
import { validateDraft, isSpam, emptyDraft } from './contact';

describe('emptyDraft', () => {
  it('seeds source + page_path and blanks the rest', () => {
    expect(emptyDraft('careers', '/contact/careers/')).toEqual({
      source: 'careers', name: '', email: '', company: '', phone: '',
      message: '', page_path: '/contact/careers/', website: '',
    });
  });
});

describe('validateDraft', () => {
  const base = emptyDraft('general');
  it('requires name, email and message', () => {
    const r = validateDraft(base);
    expect(r.ok).toBe(false);
    expect(r.errors.name).toBeTruthy();
    expect(r.errors.email).toBeTruthy();
    expect(r.errors.message).toBeTruthy();
  });
  it('rejects a malformed email', () => {
    const r = validateDraft({ ...base, name: 'A', message: 'Hi', email: 'nope' });
    expect(r.errors.email).toBeTruthy();
  });
  it('accepts a complete valid draft', () => {
    const r = validateDraft({ ...base, name: 'Ada', email: 'ada@x.com', message: 'Hello' });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual({});
  });
  it('rejects an over-long message', () => {
    const r = validateDraft({ ...base, name: 'Ada', email: 'ada@x.com', message: 'x'.repeat(5001) });
    expect(r.errors.message).toBeTruthy();
  });
});

describe('isSpam', () => {
  it('flags a filled honeypot', () => {
    expect(isSpam({ ...emptyDraft('general'), website: 'http://bot' })).toBe(true);
  });
  it('passes an empty honeypot', () => {
    expect(isSpam(emptyDraft('general'))).toBe(false);
  });
});
