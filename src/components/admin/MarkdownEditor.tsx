import { useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  className?: string;
};

type EditResult = { text: string; selStart: number; selEnd: number };
type EditFn = (text: string, start: number, end: number) => EditResult;

/** Wrap the selection with an inline marker (e.g. ** for bold). Unwraps if already wrapped. */
export function wrapSelection(
  text: string,
  start: number,
  end: number,
  marker: string,
  placeholder: string,
): EditResult {
  const selected = text.slice(start, end) || placeholder;
  const before = text.slice(Math.max(0, start - marker.length), start);
  const after = text.slice(end, end + marker.length);
  if (start >= marker.length && before === marker && after === marker) {
    return {
      text: text.slice(0, start - marker.length) + selected + text.slice(end + marker.length),
      selStart: start - marker.length,
      selEnd: start - marker.length + selected.length,
    };
  }
  return {
    text: text.slice(0, start) + marker + selected + marker + text.slice(end),
    selStart: start + marker.length,
    selEnd: start + marker.length + selected.length,
  };
}

/**
 * Prefix every line touched by the selection (e.g. "## ", "- ").
 * If every line already carries the prefix, it is removed instead (toggle).
 */
export function prefixLines(
  text: string,
  start: number,
  end: number,
  prefix: (lineIndex: number) => string,
  has: RegExp,
  strip: RegExp,
): EditResult {
  const blockStart = text.lastIndexOf('\n', start - 1) + 1;
  let blockEnd = text.indexOf('\n', end);
  if (blockEnd === -1) blockEnd = text.length;
  const lines = text.slice(blockStart, blockEnd).split('\n');
  const allPrefixed = lines.every((l) => has.test(l));
  const newBlock = lines
    .map((l, i) => (allPrefixed ? l.replace(strip, '') : prefix(i) + l.replace(strip, '')))
    .join('\n');
  return {
    text: text.slice(0, blockStart) + newBlock + text.slice(blockEnd),
    selStart: blockStart,
    selEnd: blockStart + newBlock.length,
  };
}

/** Turn the selection into a markdown link, leaving the URL placeholder selected. */
export function makeLink(text: string, start: number, end: number): EditResult {
  const label = text.slice(start, end) || 'link text';
  const url = 'https://';
  const insert = `[${label}](${url})`;
  const urlStart = start + label.length + 3; // past "[label]("
  return {
    text: text.slice(0, start) + insert + text.slice(end),
    selStart: urlStart,
    selEnd: urlStart + url.length,
  };
}

const HEADING_STRIP = /^#{1,6}\s+/;
const LIST_STRIP = /^(?:[-*]|\d+\.)\s+/;

type ToolbarButton = {
  label: React.ReactNode;
  title: string;
  apply: EditFn;
};

const GROUPS: ToolbarButton[][] = [
  [
    {
      label: 'H2',
      title: 'Heading (## )',
      apply: (t, s, e) => prefixLines(t, s, e, () => '## ', /^## /, HEADING_STRIP),
    },
    {
      label: 'H3',
      title: 'Subheading (### )',
      apply: (t, s, e) => prefixLines(t, s, e, () => '### ', /^### /, HEADING_STRIP),
    },
  ],
  [
    {
      label: <span className="font-bold">B</span>,
      title: 'Bold (**text**)',
      apply: (t, s, e) => wrapSelection(t, s, e, '**', 'bold text'),
    },
    {
      label: <span className="italic">I</span>,
      title: 'Italic (*text*)',
      apply: (t, s, e) => wrapSelection(t, s, e, '*', 'italic text'),
    },
    {
      label: 'Link',
      title: 'Link ([text](url))',
      apply: makeLink,
    },
  ],
  [
    {
      label: '• List',
      title: 'Bulleted list (- )',
      apply: (t, s, e) => prefixLines(t, s, e, () => '- ', /^- /, LIST_STRIP),
    },
    {
      label: '1. List',
      title: 'Numbered list (1. )',
      apply: (t, s, e) => prefixLines(t, s, e, (i) => `${i + 1}. `, /^\d+\. /, LIST_STRIP),
    },
    {
      label: '❝ Quote',
      title: 'Blockquote (> )',
      apply: (t, s, e) => prefixLines(t, s, e, () => '> ', /^> /, /^>\s?/),
    },
  ],
];

export default function MarkdownEditor({ value, onChange, required, rows = 15, className }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const run = (apply: EditFn) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { text, selStart, selEnd } = apply(value, ta.selectionStart, ta.selectionEnd);
    onChange(text);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  return (
    <div>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="mt-2 flex flex-wrap items-center gap-0.5 border border-ink/15 bg-surface-alt px-1.5 py-1"
      >
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <span aria-hidden="true" className="w-px h-4 bg-ink/15 mx-1" />}
            {group.map((b) => (
              <button
                key={b.title}
                type="button"
                title={b.title}
                aria-label={b.title}
                onClick={() => run(b.apply)}
                className="px-2 py-1 text-xs text-ink/70 hover:text-ink hover:bg-ink/10 rounded transition-colors duration-150 cursor-pointer"
              >
                {b.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        className={className}
      />
    </div>
  );
}
