import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import type { Job } from '../types/job';

const DEFAULT_APPLY_EMAIL = 'careers@elysee.com.cy';

export function getApplyHref(job: Job): { href: string; external: boolean } {
  if (job.apply_url && job.apply_url.trim()) {
    return { href: job.apply_url.trim(), external: true };
  }
  if (job.apply_email && job.apply_email.trim()) {
    return { href: `mailto:${job.apply_email.trim()}`, external: false };
  }
  return { href: `mailto:${DEFAULT_APPLY_EMAIL}`, external: false };
}

export function isDeadlineExpired(deadline: string | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  // Compare by date only; deadline of YYYY-MM-DD is the last accepted day.
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dl = new Date(`${deadline}T00:00:00Z`);
  return dl < today;
}

export type JobStatus = 'Live' | 'Draft' | 'Expired';

export function getStatus(job: Job, now: Date = new Date()): JobStatus {
  if (!job.is_published) return 'Draft';
  if (isDeadlineExpired(job.deadline, now)) return 'Expired';
  return 'Live';
}

marked.setOptions({ gfm: true, breaks: true });

export function renderJobDescription(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'rel', 'target'],
  });
  // Force safe link attrs on any surviving anchor.
  return sanitized.replace(
    /<a\s+([^>]*?)>/g,
    (_m, attrs) => `<a ${attrs} rel="noopener noreferrer" target="_blank">`,
  );
}
