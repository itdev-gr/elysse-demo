/** Case-insensitive substring match across a row's searchable fields.
 *  Empty/whitespace query matches everything; null fields are skipped. */
export function matchesFields(query: string, fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return fields.some((v) => v?.toLowerCase().includes(q));
}
