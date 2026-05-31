import { useState } from 'react';
import type { Job } from '../../types/job';
import { getApplyHref, renderJobDescription } from '../../lib/jobs';

type Props = { job: Job };

function formatDeadline(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function previewText(markdown: string, max = 160): string {
  const stripped = markdown.replace(/[#*_`>\-]/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > max ? stripped.slice(0, max - 1) + '…' : stripped;
}

export default function JobCard({ job }: Props) {
  const [expanded, setExpanded] = useState(false);
  const apply = getApplyHref(job);

  return (
    <article className="group bg-surface border-l-4 border-brand-500 p-6 md:p-8 transition-colors duration-300 hover:bg-surface-alt">
      <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
        {job.department} · {job.employment_type}
      </p>
      <h3 className="mt-3 font-display font-heavy text-xl md:text-2xl text-ink leading-tight">
        {job.title}
      </h3>
      <div aria-hidden="true" className="mt-4 h-px w-10 bg-brand-500"></div>

      <dl className="mt-5 space-y-1 text-sm text-ink/80">
        <div>{job.location}</div>
        {job.salary_range && <div>{job.salary_range}</div>}
        {job.deadline && <div>Apply by {formatDeadline(job.deadline)}</div>}
      </dl>

      {!expanded && (
        <p className="mt-5 text-sm md:text-base text-ink/70 leading-[1.6]">
          {previewText(job.description)}
        </p>
      )}

      {expanded && (
        <div
          className="mt-5 text-sm md:text-base text-ink/80 leading-[1.65] [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3"
          // Sanitized via DOMPurify in renderJobDescription.
          dangerouslySetInnerHTML={{ __html: renderJobDescription(job.description) }}
        />
      )}

      <div className="mt-6 flex items-center gap-3">
        <a
          href={apply.href}
          target={apply.external ? '_blank' : undefined}
          rel={apply.external ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Apply
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
        >
          {expanded ? 'Read less' : 'Read more'}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path d="M2 4l3 3 3-3" />
          </svg>
        </button>
      </div>
    </article>
  );
}
