# Zeta Group-Detail View in the Visibility Tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline A/B marks on Zeta size rows with two dedicated sections — **Group A** and **Group B** — each listing every Zeta code with its own checkbox (tick = that code is visible in that group's countries).

**Architecture:** Pure additions to `src/lib/visibility.ts` (membership counting) + a restructure inside `VisibilityTab.tsx`: after the Zeta series' normal show/hide list, render one membership panel per market group, reusing the existing config→size tree and the already-loaded `abMembers` map. Bulk ticking uses PK-safe upsert (`onConflict: 'product_code,group_code', ignoreDuplicates`), bulk unticking uses `delete ... in (codes)`.

**Tech Stack:** React admin island, supabase-js, vitest.

## Global Constraints

- INTERPRETATION (user away when asked): **per group**, not per country — ticking a code under Group A makes it visible in ALL Group A countries. If the user meant per-country lists, STOP and re-plan (that needs a new public-site gating model).
- Zeta rows only (`isZetaSeries`), same as the existing amendment. Groups C/D/E untouched.
- The main show/hide checkbox list stays exactly as is; the inline per-size A/B marks are REMOVED (superseded by the panels).
- Group headers show the group's countries dynamically from `group_countries` — never hardcode country lists (project rule: hardcoded lists rot).
- `triggerPublish()` after successful writes; optimistic UI with reload-on-error; 23505 races impossible via `ignoreDuplicates: true` (PK `product_code, group_code` verified in 0016).

---

### Task 1: Membership-count helper (TDD)

**Files:**
- Modify: `src/lib/visibility.ts`, `src/lib/visibility.test.ts`

**Interfaces — Produces:**
```ts
export function membershipCounts(
  codes: string[], members: Map<string, Set<string>>, group: string,
): { member: number; total: number };
```
(Feeds the existing `triState(member, total)` for panel/config checkboxes.)

- [ ] **Step 1: Failing tests** — append to `visibility.test.ts`:

```ts
describe('membershipCounts', () => {
  const members = new Map<string, Set<string>>([
    ['Z1', new Set(['A', 'B'])],
    ['Z2', new Set(['B'])],
  ]);
  it('counts members of the given group among the codes', () => {
    expect(membershipCounts(['Z1', 'Z2', 'Z3'], members, 'A')).toEqual({ member: 1, total: 3 });
    expect(membershipCounts(['Z1', 'Z2', 'Z3'], members, 'B')).toEqual({ member: 2, total: 3 });
  });
  it('handles empty code lists', () => {
    expect(membershipCounts([], members, 'A')).toEqual({ member: 0, total: 0 });
  });
});
```

- [ ] **Step 2: Run to fail.** `npx vitest run src/lib/visibility.test.ts` → FAIL (not exported).
- [ ] **Step 3: Implement** in `visibility.ts`:

```ts
/** How many of `codes` belong to `group`, per the memberships map. */
export function membershipCounts(
  codes: string[], members: Map<string, Set<string>>, group: string,
): { member: number; total: number } {
  const member = codes.filter((c) => members.get(c)?.has(group)).length;
  return { member, total: codes.length };
}
```

- [ ] **Step 4: Run to pass**, then full `npm test`.
- [ ] **Step 5: Commit.** `feat(admin): membershipCounts helper for Zeta group panels`

### Task 2: Group panels in VisibilityTab

**Files:**
- Modify: `src/components/admin/VisibilityTab.tsx`

**Interfaces — Consumes:** `membershipCounts` (Task 1), existing `abMembers`, `TriBox`, `triState`, `codesForConfig`, `isZetaSeries`; `group_countries` rows.

- [ ] **Step 1: Load group country labels.** Alongside `loadMemberships`, fetch `group_countries` (`group_code, country`, ordered) into `Record<string, string[]>` state `groupCountries`.
- [ ] **Step 2: Bulk membership writer.**

```ts
const setGroupBulk = async (codes: string[], group: string, on: boolean) => {
  if (!codes.length || busy || !abMembers) return;
  setBusy(true); setError(null);
  const next = new Map(abMembers);
  for (const c of codes) {
    const set = new Set(next.get(c) ?? []);
    if (on) set.add(group); else set.delete(group);
    next.set(c, set);
  }
  setAbMembers(next);
  for (const part of chunk(codes, CHUNK)) {
    const { error: err } = on
      ? await supabase.from('product_group_memberships').upsert(
          part.map((product_code) => ({ product_code, group_code: group })),
          { onConflict: 'product_code,group_code', ignoreDuplicates: true })
      : await supabase.from('product_group_memberships')
          .delete().in('product_code', part).eq('group_code', group);
    if (err) {
      setError(`Save failed: ${err.message} — group list reloaded.`);
      await loadMemberships(); setBusy(false); return;
    }
  }
  setBusy(false); triggerPublish();
};
```
(Single-checkbox toggles call `setGroupBulk([code], g, on)`; delete the old `setGroupMembership`.)

- [ ] **Step 3: Replace the inline A/B marks with panels.** Remove the `isZetaSeries(c.series) && (...)` block from size rows and the series-header legend. After the series' config `<ul>`, when `isZetaSeries(s.series)`, render for each of `MARKET_GROUPS`: a bordered subsection with header `Group {g} — {groupCountries[g]?.join(', ')}` + panel-level TriBox (`triState(...membershipCounts(codesForSeries(s), abMembers, g))`) + count text; inside, each config as a row (config-level TriBox via `membershipCounts(codesForConfig(c), ...)` + name) with its sizes as compact checkbox chips (`checked = abMembers.get(code)?.has(g)`), all disabled while `abMembers === null`.
- [ ] **Step 4: Verify.** `npm test`, `npx tsc --noEmit --ignoreDeprecations 6.0` (only the 2 pre-existing errors), `npm run build`.
- [ ] **Step 5: Commit.** `feat(admin): Zeta Group A/B membership panels replace inline marks`

### Task 3: Live verification + docs

- [ ] **Step 1: Data loop (pattern already user-approved):** toggle ONE Zeta size's Group A membership via Management API, confirm the catalog for a Group A country drops/regains it (listing `?country=` behavior or availableCountries), restore, checker clean.
- [ ] **Step 2: Push; user clicks through** the panels after deploy.
- [ ] **Step 3:** Spec amendment note + memory update + tick this plan's boxes.

## Self-Review

- Two group sections listing every Zeta code with own checkbox → Task 2 Step 3. ✓
- Countries shown per group, fetched not hardcoded → Task 2 Steps 1/3. ✓
- Bulk + single toggles PK-safe, chunked, optimistic → Task 2 Step 2. ✓
- Old inline marks removed (no duplicate controls) → Task 2 Step 3. ✓
- Per-country caveat documented as the one open interpretation risk → Global Constraints. ✓
