# Globe smoke-test follow-ups (production: elysse-demo.vercel.app)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Address the residual visual bugs the smoke test surfaced on the deployed 3-D globe at `/contact/worldwide/` — most notably markers floating in empty space beside the globe and an over-large pin/spike on small viewports.

**Architecture:** All fixes live in one vendor file, `src/components/ui/3d-globe.tsx`. They are small tuning changes (1–2 lines each) plus one mesh-visibility flip; no new files, no new dependencies, no API changes.

**Tech Stack:** Astro 6, React 19 island, `@react-three/fiber`, `@react-three/drei`'s `<Html>`, three.js r184.

---

## Smoke-test findings (what was observed)

Tested at https://elysse-demo.vercel.app/contact/worldwide/ with Playwright at 1280×900 desktop and 390×844 mobile viewports. Globe auto-rotates on a loop.

| # | Severity | Symptom | Evidence |
|---|---|---|---|
| 1 | **High** | Flag markers near the silhouette of the visible hemisphere render **outside** the projected globe outline — they appear to "float" in empty space beside the sphere. Visible on mobile as the SA flag floating below-right of the globe; visible on desktop as the EU/Mediterranean cluster appearing past the left silhouette. | mobile screenshot showed SA flag in white space below the globe; desktop screenshot showed Cyprus/Lebanon/Greece/Turkey/Egypt clustered at the left silhouette extending past the visible sphere |
| 2 | **Medium** | The pin/spike "spear" connecting each marker to the globe surface is visually prominent on small viewports (≈17 % of globe-radius long, ≈30 px on the 343 px mobile canvas). Several pins stick straight up from the top of the globe with no visible flag at the tip, reading as random spears. | mobile screenshot: 4–5 vertical white spikes pointing up from the visible Europe/Russia area |
| 3 | **Low** | Console warning on every page load: `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` Library-level, not actionable in our code today but worth noting. | DevTools console |
| 4 | **None** | Click-to-fill correctly populates the right panel for any visible marker (Japan → "Japan", country field, prefilled message). | Playwright verified: clicking the JP `<img>` set heading "Japan" + country input "Japan" + message starting "Hi Elysée — I am enquiring from Japan…" |
| 5 | **None** | Markers on the back hemisphere are correctly hidden via `visibility: hidden` (AU, NZ when Africa-facing). They are also not clickable by real users because the wrapper's `pointer-events: none` blocks pointer events. (Programmatic `.click()` bypasses CSS, which is why an earlier test misled me — not a real user-facing bug.) | Playwright: AU + NZ reported `visibility:hidden` while NZ at lng 174°E and globe facing Africa |
| 6 | **None** | Console errors: **zero**. | DevTools console |

Root cause for #1 is geometric: each marker has two anchor points, `surfacePosition = latLngToVector3(lat, lng, radius * 1.001)` and `topPosition = latLngToVector3(lat, lng, radius * 1.18)`. The flag `<Html>` is anchored to `topPosition`, i.e. 18 % radially outside the sphere. When a marker is near the silhouette of the visible hemisphere, the 18 % offset projects the flag to a screen coordinate **outside** the visible sphere outline, in empty canvas space.

Root cause for #2 is that the pin cylinder + the surface cone are both rendered as 3-D meshes inside the marker group. With the current `radius * 1.18` top offset they are 17.9 % of the sphere radius — perfectly fine on a 680 px desktop canvas, jarring on a 343 px mobile one.

---

## File structure (no new files)

| File | Responsibility | Why touched |
|---|---|---|
| `src/components/ui/3d-globe.tsx` | Aceternity vendor globe + Marker subcomponent | Only file with code changes — 3 small tuning edits inside the `Marker` component |

---

## Tasks

### Task 1: Move the marker flag onto the globe surface (kills the "floating off the globe" bug)

**Files:**
- Modify: `src/components/ui/3d-globe.tsx`

- [ ] **Step 1.1: Read the current marker position math** to confirm the line numbers haven't shifted since this plan was written.

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
sed -n '130,145p' src/components/ui/3d-globe.tsx
```

You should see something like:

```ts
// Surface position (where the line starts)
const surfacePosition = useMemo(() => {
  return latLngToVector3(marker.lat, marker.lng, radius * 1.001);
}, [marker.lat, marker.lng, radius]);

// Top of the line (where the image is) - positioned further out to prevent going inside globe
const topPosition = useMemo(() => {
  return latLngToVector3(marker.lat, marker.lng, radius * 1.18);
}, [marker.lat, marker.lng, radius]);
```

- [ ] **Step 1.2: Tighten the top-position offset from 1.18 → 1.04**

Edit `src/components/ui/3d-globe.tsx`. Replace the line:

```ts
return latLngToVector3(marker.lat, marker.lng, radius * 1.18);
```

with:

```ts
return latLngToVector3(marker.lat, marker.lng, radius * 1.04);
```

This places the flag 4 % radially outside the surface — just enough to avoid z-fighting with the globe mesh but no longer pushing the flag visibly off the sphere silhouette when the marker is near the horizon.

- [ ] **Step 1.3: Build verify**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
npm run build 2>&1 | tail -3
```

Expected: `[build] Complete!`, 59 pages, no TS errors.

- [ ] **Step 1.4: Commit**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git add src/components/ui/3d-globe.tsx
git commit -m "fix(globe): anchor flag closer to surface so it does not float off near the silhouette"
```

---

### Task 2: Hide the pin line + cone meshes (kills the "random spear" bug)

**Files:**
- Modify: `src/components/ui/3d-globe.tsx`

The pin line and cone are decorative — the user experience does not need them. Once the flag is anchored within 4 % of the surface (Task 1) the flag itself is unambiguous; the spike becomes visual noise, especially on mobile.

- [ ] **Step 2.1: Read the marker JSX** to find the two meshes to hide:

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
sed -n '195,225p' src/components/ui/3d-globe.tsx
```

You should see two `<mesh>` blocks — a `cylinderGeometry` for the line and a `coneGeometry` for the pin cone.

- [ ] **Step 2.2: Remove (or hide) both meshes**

Open `src/components/ui/3d-globe.tsx`. Delete the JSX for the pin line and pin cone. Specifically, delete:

```tsx
{/* Pin line from surface to image - properly oriented */}
<mesh position={lineCenter} quaternion={lineQuaternion}>
  <cylinderGeometry args={[0.003, 0.003, lineHeight, 8]} />
  <meshBasicMaterial
    color={hovered ? "#ffffff" : "#94a3b8"}
    transparent
    opacity={hovered ? 0.9 : 0.6}
  />
</mesh>

{/* Pin point at the surface */}
<mesh position={surfacePosition} quaternion={lineQuaternion}>
  <coneGeometry args={[0.015, 0.04, 8]} />
  <meshBasicMaterial color={hovered ? "#f97316" : "#ef4444"} />
</mesh>
```

The remaining `<group ref={imageGroupRef} position={topPosition}>` with the `<Html>` flag stays.

- [ ] **Step 2.3: Remove the now-dead `lineHeight`, `lineCenter`, `lineQuaternion`, and the `useMemo` that produces them**

After Step 2.2 those locals have no consumers. Remove the `useMemo` block that returns `{ lineCenter, lineQuaternion }` and the line `const lineHeight = topPosition.distanceTo(surfacePosition);`.

- [ ] **Step 2.4: Build verify**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
npm run build 2>&1 | tail -3
```

Expected: `[build] Complete!`, 59 pages, no TS errors. If TS complains about unused variables, also remove the references it flags.

- [ ] **Step 2.5: Commit**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git add src/components/ui/3d-globe.tsx
git commit -m "fix(globe): remove decorative pin line + cone (read as spikes on mobile)"
```

---

### Task 3: Playwright verification at desktop and mobile

**Files:**
- (No source changes — runtime verification only.)

- [ ] **Step 3.1: Visit local dev at 1280×900**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
# Dev server should already be running on :4321 — if not: npm run dev
```

Use the Playwright MCP tools:

1. `mcp__playwright__browser_navigate` → `http://localhost:4321/contact/worldwide/`
2. `mcp__playwright__browser_resize` → 1280 × 900
3. `mcp__playwright__browser_evaluate` → scroll the `Sixty-five destinations.` H2 into view, wait 5000 ms for hydration + a first auto-rotate pass.
4. `mcp__playwright__browser_take_screenshot` → save as `smoke-after-1280.png`.

Read the screenshot. **Pass criteria:**

- The globe is visible and contains the expected continents.
- Flag markers sit **on** the sphere surface — no flags floating in white space outside the sphere outline.
- No vertical pin spikes/spears extending upward or outward from markers (Task 2 should have removed them).
- Console: 0 errors. (1 deprecation warning for `THREE.Clock` is acceptable — library-level.)

- [ ] **Step 3.2: Mobile viewport — 390×844**

1. `mcp__playwright__browser_resize` → 390 × 844
2. Scroll the H2 back into view, wait 3000 ms.
3. `mcp__playwright__browser_take_screenshot` → save as `smoke-after-mobile.png`.

**Pass criteria:**

- Globe is visible inside the 343-px-wide canvas.
- No flag is rendered in white space outside the sphere.
- No pin spikes visible at the top/edges of the globe.
- South Africa flag, when visible, is **on** South Africa (not floating below the globe).

- [ ] **Step 3.3: Click-to-fill regression check**

1. Click any clearly visible marker (Japan when Asia is facing, or Cyprus when EU is facing).
2. Verify the right `<aside>` populates with the country's heading, address card, and pre-filled message in the textarea.

If any of Steps 3.1–3.3 fails, do NOT commit further. Report DONE_WITH_CONCERNS, include the failing screenshot path, and stop.

- [ ] **Step 3.4: Clean up screenshot artefacts**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
rm -f smoke-after-1280.png smoke-after-mobile.png
```

(No commit — verification only.)

---

### Task 4: Push to production

**Files:**
- (No source changes.)

- [ ] **Step 4.1: Push main**

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
git push origin main
```

- [ ] **Step 4.2: Wait for Vercel auto-deploy** (≈60 s) then revisit https://elysse-demo.vercel.app/contact/worldwide/, scroll to the globe, drag the globe to several rotations, and confirm:

- Markers are **on** the globe at every rotation.
- No floating flags off the silhouette.
- No pin spears.
- Tapping Cyprus (when EU-facing) fills the form with Cyprus details.

---

## Out of scope

- `THREE.Clock` deprecation warning (Finding 3) — three.js library will fix this; we can revisit when we bump the dep.
- Marker click hit-area / accessibility (keyboard nav, screen-reader label semantics) — separate UX pass.
- Marker label tooltip on hover — currently the only feedback on hover is a `scale-125` ring; the `label` field on `GlobeMarker` is unused.
- The `initialRotation` config key flagged as dead code in an earlier review — leave for a separate cleanup.
- The projection math (`latLngToVector3`) — confirmed correct in the previous fix (commit `67ffad7`); do not change.

---

## Self-review

**Spec coverage:** every Finding above with severity ≥ Medium has a Task that addresses it (Findings 1 and 2). Findings 3–6 are explicitly called out as Low / non-issues.

**Placeholder scan:** zero "TBD", "add validation here", or "implement later" notes. All steps contain runnable commands and complete code.

**Type consistency:** the only locals named in this plan (`surfacePosition`, `topPosition`, `lineHeight`, `lineCenter`, `lineQuaternion`) exist verbatim in the current vendor file; Task 2 removes them together as a coherent group.
