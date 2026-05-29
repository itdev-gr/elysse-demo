/**
 * Splits a paragraph into "lines" for kinetic reveal — one sentence per line,
 * with very short fragments (< 12 chars) merged into the next sentence so the
 * stagger animation doesn't read as choppy.
 */
export function splitIntoLines(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].length < 12 && i + 1 < raw.length) {
      raw[i + 1] = `${raw[i]} ${raw[i + 1]}`;
    } else {
      out.push(raw[i]);
    }
  }
  return out.length ? out : [text];
}
