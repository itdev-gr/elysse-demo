# History Page Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `http://localhost:4329/about-us/history/` so it mirrors the narrative depth and milestone coverage of `https://elysee.com.cy/history-elysee-en`, using only the existing design system (`ContentPageLayout` + `PageHero` + `Timeline` + `StatGrid` + callout/list/heading blocks).

**Architecture:** The page is rendered by `src/pages/about-us/history/index.astro`, which is a one-line wrapper around `<ContentPageLayout content={aboutUsHistory} />`. The layout already supports every block kind we need (`heading`, `paragraph`, `list`, `callout`, `stats`, `timeline`). So the rebuild is a **content-only edit** to the `aboutUsHistory` export in `src/data/site-content.ts`. No new components, no layout changes, no new files.

**Tech Stack:** Astro 6 (static), Tailwind v4, existing component primitives in `src/components/`.

**Constraint from user memory (`feedback_preserve_existing_design.md`):** Edit content in place; do not delete the existing design. → We rewrite only the `aboutUsHistory` const. The page file, layout, components, and `PageHero` band stay untouched.

**Constraint from user memory (`feedback_no_commit_until_review.md`):** No `git commit` / `git push` until the user reviews and approves. → The final step is a verification + handoff, not a commit.

---

## File Structure

- **Modify:** `src/data/site-content.ts` (lines 149–179) — replace the `aboutUsHistory` content object.
- **Untouched:** `src/pages/about-us/history/index.astro`, `src/layouts/ContentPageLayout.astro`, all components.

The only edit is one named export. Self-contained, reversible by replacing the block back.

---

## Source → Block Mapping

| Source page element | Target block |
|---|---|
| Founder narrative (Antonis Protopapas, physics + agriculture, flowers in the Middle East) | 2× `paragraph` |
| 1970s irrigation pivot | `paragraph` |
| "Streaming Water, Streaming Life" ethos (echoed from sibling pages, ties history to today) | `callout` |
| 1979 → 2016 milestones (9 entries) | `timeline` |
| Current footprint: 65 markets, 4 sectors, distribution centres | `stats` (4 tiles) |
| Original product range (drippers, sprinklers, etc.) | `list` |
| Sectors served today (Water Supply / Irrigation / Infrastructure / Energy) | `heading` + `list` or `paragraph` |
| Closing line about local agents / network | `paragraph` |

This adds breadth without inventing facts not in the source — every claim traces to the crawled content.

---

## Task 1: Replace the `aboutUsHistory` export with the enriched version

**Files:**
- Modify: `src/data/site-content.ts:149-179`

- [ ] **Step 1: Open the file and locate the existing export**

The target block currently runs from line 149 (`export const aboutUsHistory: ContentPage = {`) through line 179 (closing `};` before `export const aboutUsVisionMissionValues`).

- [ ] **Step 2: Replace the entire `aboutUsHistory` const with this expanded version**

Use the `Edit` tool with `old_string` set to the current 31-line block and `new_string` set to:

```ts
export const aboutUsHistory: ContentPage = {
  title: 'History',
  eyebrow: 'About Us',
  subtitle: 'A family business, built one decade at a time.',
  blocks: [
    {
      kind: 'paragraph',
      text:
        "It was a love of nature that led to the birth of Elysée. With origins in agriculture and a degree in physics, founder Antonis Protopapas had the idea to build a business focused on growing the best flowers in the Middle East.",
    },
    {
      kind: 'paragraph',
      text:
        "Through the 1970s, irrigation knowledge became indispensable to the flower-growing venture. What began as a need to source better irrigation supplies turned into trading them — and, soon after, manufacturing them.",
    },
    {
      kind: 'paragraph',
      text:
        "So, on 16 April 1979, Elysée Irrigation was founded in Nicosia, Cyprus. From a small operation focused on drippers and fittings, the company grew steadily through the eighties and nineties on the back of exports, in-house manufacturing, and a quality system that earned international recognition.",
    },
    {
      kind: 'callout',
      title: 'Streaming Water, Streaming Life',
      body:
        'The same conviction that started the company still drives it today: build reliable systems that carry water — and Life — safely to where it is needed.',
    },
    { kind: 'heading', level: 2, text: 'Milestones' },
    {
      kind: 'timeline',
      items: [
        { year: '1979', title: 'Elysée Irrigation founded', body: 'Established on 16 April 1979 in Nicosia, Cyprus, by Antonis Protopapas.' },
        { year: '1980', body: 'First export activities begin, into nearby markets across the Middle East.' },
        { year: '1989', body: 'Current industrial facility opens in the Ergates Industrial Area to accommodate a growing range of drippers, sprinklers, compression fittings, saddles, and threaded fittings.' },
        { year: '1991', body: 'A polyethylene pipe manufacturing unit is launched, enabling complete water-supply solutions.' },
        { year: '1998', body: 'ISO 9001 certification achieved after the formal establishment of the quality-control division.' },
        { year: '2001', body: 'A new head-office building is erected in Ergates; headquarters relocate from central Nicosia.' },
        { year: '2002', body: 'Special Export Award received. Research and Development department created.' },
        { year: '2003 – 2016', body: 'Four further Export Awards (2003, 2008, 2012, 2016). Elysée products are now sold across all five continents.' },
        { year: 'Today', body: 'Active in 65 markets across four sectors — Water Supply, Irrigation, Infrastructure, Energy — with distribution centres in Austria, Russia, and Lebanon.' },
      ],
    },
    { kind: 'heading', level: 2, text: 'Where we are today' },
    {
      kind: 'stats',
      items: [
        { label: 'Markets served', value: '65' },
        { label: 'Sectors', value: '4' },
        { label: 'Export awards', value: '5' },
        { label: 'ISO 9001 since', value: '1998' },
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Elysée operates across four sectors — Water Supply, Irrigation, Infrastructure, and Energy — supported by distribution centres in Austria, Russia, and Lebanon and a network of local agents and sales representatives.',
    },
    { kind: 'heading', level: 3, text: 'Where it started' },
    {
      kind: 'paragraph',
      text:
        'The product range that put Elysée on the map in the 1980s still anchors the catalogue today:',
    },
    {
      kind: 'list',
      items: [
        'Drippers',
        'Sprinklers',
        'Compression fittings',
        'Saddles',
        'Threaded fittings',
      ],
    },
    {
      kind: 'paragraph',
      text:
        'Enquiries and orders reach us through our wide network of local agents and sales representatives.',
    },
  ],
};
```

- [ ] **Step 3: Save, then check the dev server output for HMR success**

Run: `tail -n 40 /private/tmp/claude-501/-Users-marios-Desktop-Cursor-elysse-demo/d55105aa-47d9-49f6-80cf-2649335db3a0/tasks/b4yv67zno.output`
Expected: a `[vite]` HMR update line or `page reload` for `src/data/site-content.ts`, no red error stacks.

If a TypeScript error appears: it will be a typo in a block `kind` or a missing field. Fix and re-save.

- [ ] **Step 4: Verify the page in the browser**

Open `http://localhost:4329/about-us/history/`.

Visual checks:
- Green `PageHero` band at the top with eyebrow "About Us", title "History", subtitle "A family business, built one decade at a time."
- Three intro paragraphs followed by the green-tinted "Streaming Water, Streaming Life" callout block.
- An "h2: Milestones" heading, then the 9-row Timeline with green vertical rule and dots.
- An "h2: Where we are today" heading, then a 4-tile StatGrid (65 / 4 / 5 / 1998), then a paragraph naming the four sectors and three distribution centres.
- An "h3: Where it started" heading, a one-line lead, then a 5-bullet product list.
- Final closing paragraph about local agents.

If any block renders as raw text or in the wrong style, the `kind` discriminator on that block is wrong — re-check against `ContentPageLayout.astro:19-38`.

- [ ] **Step 5: Hand off — do NOT commit**

Per `feedback_no_commit_until_review.md`, stop here. Surface the rendered page to the user and wait for explicit approval before any `git add` / `git commit`.

---

## Self-Review

**Spec coverage:**
- Founder + flower origin → covered (paragraph 1).
- 1970s irrigation pivot → covered (paragraph 2).
- 16 April 1979 founding → covered (paragraph 3 + timeline 1979 row).
- 1980 export start → timeline.
- 1989 Ergates facility → timeline.
- 1991 polyethylene unit → timeline.
- 1998 ISO 9001 → timeline + stat tile.
- 2001 new HQ building → timeline.
- 2002 Special Export Award + R&D dept → timeline.
- 2003 / 2008 / 2012 / 2016 Export Awards → timeline range entry + stat tile.
- Today: 65 markets, 4 sectors, distribution centres → timeline "Today" row + stats + sectors paragraph.
- Original product range → list.
- Local agents closing line → final paragraph.
- "Streaming Water, Streaming Life" ethos → callout. (Verified the phrase appears verbatim in sibling page `your-marine-energy-provider` / `index.astro` data and on the live elysee.com.cy site as a recurring tagline, so it is not invented.)

**Placeholder scan:** No "TBD", no "etc.", no "implement later", no skipped steps.

**Type consistency:** Every block uses an existing kind from `src/data/site-content.ts:52-60`. The `stats` block matches `StatBlock` (label/value pairs). The `timeline` block matches `TimelineBlock` (year/title?/body). All confirmed against the type definitions in the same file (lines 7–60).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-26-history-page-rebuild.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
