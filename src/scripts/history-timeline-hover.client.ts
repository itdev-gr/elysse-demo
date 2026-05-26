/**
 * Hover-tooltip for the history-page timeline.
 *
 * Wires `mouseenter` / `mouseleave` (and `focusin` / `focusout` for keyboard)
 * on every `[data-timeline-trigger]` element to a single fixed-position
 * `[data-timeline-tooltip]` element rendered once in /about-us/history/demo.
 *
 * Animation is driven by GSAP:
 *   - enter:  opacity 0 → 1, scale 0.96 → 1, duration 0.22, ease 'power2.out'
 *   - exit:   opacity → 0, scale → 0.96, duration 0.16, ease 'power2.in'
 *   - move:   when the user slides from one item to another while the tooltip
 *             is already visible, GSAP tweens `left` / `top` over 0.18s with
 *             ease 'power3.out' so the card glides into its new anchor point.
 *
 * Disabled on viewports < 1024px and on coarse-pointer devices.
 */

import { gsap } from 'gsap';

type TooltipState = {
  tooltip: HTMLElement;
  img: HTMLImageElement;
  triggers: HTMLElement[];
};

const HORIZONTAL_OFFSET = 24;

function shouldEnable(): boolean {
  if (typeof window === 'undefined') return false;
  const lg = window.matchMedia('(min-width: 1024px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return lg && !coarse;
}

function setup(): TooltipState | null {
  const tooltip = document.querySelector<HTMLElement>('[data-timeline-tooltip]');
  const img = document.querySelector<HTMLImageElement>('[data-timeline-tooltip-img]');
  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>('[data-timeline-trigger]'),
  );
  if (!tooltip || !img || triggers.length === 0) return null;

  gsap.set(tooltip, { opacity: 0, scale: 0.96, transformOrigin: '50% 50%' });

  return { tooltip, img, triggers };
}

function computeAnchor(tooltip: HTMLElement, trigger: HTMLElement): { left: number; top: number } {
  const rect = trigger.getBoundingClientRect();
  const tipW = tooltip.offsetWidth;
  const tipH = tooltip.offsetHeight;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  let left = rect.right + HORIZONTAL_OFFSET;
  let top = rect.top + rect.height / 2 - tipH / 2;

  if (left + tipW > viewportW - 16) {
    left = rect.left - tipW - HORIZONTAL_OFFSET;
  }
  if (top < 16) top = 16;
  if (top + tipH > viewportH - 16) top = viewportH - tipH - 16;

  return { left, top };
}

function show(state: TooltipState, trigger: HTMLElement): void {
  const src = trigger.dataset.timelineImage ?? '';
  const alt = trigger.dataset.timelineImageAlt ?? '';
  if (!src) return;

  if (state.img.getAttribute('src') !== src) {
    state.img.src = src;
    state.img.alt = alt;
  }

  const anchor = computeAnchor(state.tooltip, trigger);
  // Use the current rendered opacity to decide whether to snap-in or glide.
  // This is robust against in-flight hide() tweens — every show() ends at
  // opacity:1 scale:1 regardless of prior state.
  const currentOpacity = parseFloat(getComputedStyle(state.tooltip).opacity || '0');
  if (currentOpacity < 0.1) {
    gsap.set(state.tooltip, { left: anchor.left, top: anchor.top });
  }

  gsap.to(state.tooltip, {
    left: anchor.left,
    top: anchor.top,
    opacity: 1,
    scale: 1,
    duration: currentOpacity < 0.1 ? 0.22 : 0.18,
    ease: currentOpacity < 0.1 ? 'power2.out' : 'power3.out',
    overwrite: 'auto',
  });
}

function hide(state: TooltipState): void {
  gsap.to(state.tooltip, {
    opacity: 0,
    scale: 0.96,
    duration: 0.16,
    ease: 'power2.in',
    overwrite: 'auto',
  });
}

function attach(state: TooltipState): void {
  for (const trigger of state.triggers) {
    trigger.addEventListener('mouseenter', () => show(state, trigger));
    trigger.addEventListener('mouseleave', () => hide(state));
    trigger.addEventListener('focusin', () => show(state, trigger));
    trigger.addEventListener('focusout', () => hide(state));
  }

  let raf = 0;
  const reAnchor = () => {
    const hovered = state.triggers.find((t) => t.matches(':hover, :focus-within'));
    if (!hovered) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const a = computeAnchor(state.tooltip, hovered);
      gsap.set(state.tooltip, { left: a.left, top: a.top });
    });
  };
  window.addEventListener('scroll', reAnchor, { passive: true });
  window.addEventListener('resize', reAnchor);
}

function init(): void {
  if (!shouldEnable()) return;
  const state = setup();
  if (!state) return;
  attach(state);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
