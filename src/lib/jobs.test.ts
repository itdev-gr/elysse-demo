import { describe, expect, it } from 'vitest';
import {
  getApplyHref,
  isDeadlineExpired,
  getStatus,
  renderJobDescription,
} from './jobs';
import type { Job } from '../types/job';

const baseJob: Job = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Engineer',
  location: 'Cyprus',
  employment_type: 'Full-time',
  department: 'R&D',
  description: 'Body',
  salary_range: null,
  deadline: null,
  apply_email: null,
  apply_url: null,
  is_published: true,
  created_at: '2026-05-31T00:00:00Z',
  updated_at: '2026-05-31T00:00:00Z',
};

describe('getApplyHref', () => {
  it('prefers apply_url when set', () => {
    expect(getApplyHref({ ...baseJob, apply_url: 'https://x.io/apply', apply_email: 'a@b.c' }))
      .toEqual({ href: 'https://x.io/apply', external: true });
  });
  it('falls back to apply_email mailto', () => {
    expect(getApplyHref({ ...baseJob, apply_email: 'a@b.c' }))
      .toEqual({ href: 'mailto:a@b.c', external: false });
  });
  it('falls back to careers@elysee.com.cy', () => {
    expect(getApplyHref(baseJob))
      .toEqual({ href: 'mailto:careers@elysee.com.cy', external: false });
  });
});

describe('isDeadlineExpired', () => {
  const today = new Date('2026-05-31T12:00:00Z');
  it('returns false when deadline is null', () => {
    expect(isDeadlineExpired(null, today)).toBe(false);
  });
  it('returns false when deadline is today', () => {
    expect(isDeadlineExpired('2026-05-31', today)).toBe(false);
  });
  it('returns true when deadline is in the past', () => {
    expect(isDeadlineExpired('2026-05-30', today)).toBe(true);
  });
  it('returns false when deadline is in the future', () => {
    expect(isDeadlineExpired('2026-06-01', today)).toBe(false);
  });
});

describe('getStatus', () => {
  const today = new Date('2026-05-31T12:00:00Z');
  it('Draft when not published', () => {
    expect(getStatus({ ...baseJob, is_published: false }, today)).toBe('Draft');
  });
  it('Expired when deadline passed even if published', () => {
    expect(getStatus({ ...baseJob, deadline: '2026-05-30' }, today)).toBe('Expired');
  });
  it('Live when published and not expired', () => {
    expect(getStatus(baseJob, today)).toBe('Live');
  });
});

describe('renderJobDescription', () => {
  it('renders bold and lists', () => {
    const html = renderJobDescription('**Hi**\n\n- one\n- two');
    expect(html).toContain('<strong>Hi</strong>');
    expect(html).toContain('<li>one</li>');
  });
  it('strips script tags', () => {
    const html = renderJobDescription('hi <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
  it('adds rel and target to anchors', () => {
    const html = renderJobDescription('[link](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});
