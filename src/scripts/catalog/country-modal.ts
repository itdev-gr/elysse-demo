import type { Country } from './types';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let activeKeydown: ((e: KeyboardEvent) => void) | null = null;
let priorBodyOverflow = '';
let previouslyFocused: Element | null = null;

/* The dropdown mirrors the header language switcher: a trigger button with a
 * rotating chevron and a listbox panel of option buttons. State lives at
 * module level so the DOM listeners are wired once per page. */
let picked: Country | '' = '';
let currentPick: ((country: Country) => void) | null = null;
let closeMenu: (() => void) | null = null;

function wirePicker(modal: HTMLElement): void {
  if (modal.dataset.pickerWired) return;
  modal.dataset.pickerWired = 'true';

  const trigger = modal.querySelector<HTMLButtonElement>('[data-country-trigger]');
  const label = modal.querySelector<HTMLElement>('[data-country-label]');
  const menu = modal.querySelector<HTMLElement>('[data-country-menu]');
  const chevron = modal.querySelector<SVGElement>('[data-country-chevron]');
  const submit = modal.querySelector<HTMLButtonElement>('[data-country-submit]');
  const options = Array.from(modal.querySelectorAll<HTMLButtonElement>('[data-country-option]'));
  if (!trigger || !label || !menu || !submit) return;

  const setOpen = (open: boolean) => {
    menu.classList.toggle('hidden', !open);
    trigger.setAttribute('aria-expanded', String(open));
    chevron?.classList.toggle('rotate-180', open);
    if (open) {
      (options.find((o) => o.getAttribute('aria-selected') === 'true') ?? options[0])?.focus();
    }
  };
  closeMenu = () => {
    if (menu.classList.contains('hidden')) return;
    setOpen(false);
    trigger.focus();
  };

  trigger.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));

  menu.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-country-option]');
    if (!btn) return;
    picked = (btn.dataset.value ?? '') as Country | '';
    label.textContent = btn.querySelector('[data-country-option-name]')?.textContent ?? btn.textContent ?? '';
    trigger.classList.remove('text-ink/50');
    trigger.classList.add('text-ink');
    options.forEach((o) => {
      const isActive = o === btn;
      o.setAttribute('aria-selected', String(isActive));
      o.classList.toggle('text-brand-500', isActive);
      o.classList.toggle('font-semibold', isActive);
    });
    submit.disabled = !picked;
    setOpen(false);
    trigger.focus();
  });

  // Arrow keys walk the list while it is open.
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const idx = options.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === 'Home' ? 0 :
      e.key === 'End' ? options.length - 1 :
      e.key === 'ArrowDown' ? Math.min(idx + 1, options.length - 1) :
      Math.max(idx - 1, 0);
    options[next]?.focus();
  });

  // Clicking anywhere else in the modal card dismisses the open list.
  modal.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('[data-country-picker]')) closeMenu?.();
  });

  submit.addEventListener('click', () => {
    if (!picked) return;
    const c = picked;
    closeCountryModal();
    currentPick?.(c);
    currentPick = null;
  });

  const resetPicker = () => {
    picked = '';
    label.textContent = label.dataset.placeholder ?? '';
    trigger.classList.add('text-ink/50');
    trigger.classList.remove('text-ink');
    options.forEach((o) => {
      o.setAttribute('aria-selected', 'false');
      o.classList.remove('text-brand-500', 'font-semibold');
    });
    submit.disabled = true;
    setOpen(false);
  };
  modal.addEventListener('country-modal:reset', resetPicker);
}

export function openCountryModal(onPick: (country: Country) => void): void {
  const modal = document.querySelector<HTMLElement>('[data-country-modal]');
  if (!modal) return;
  if (activeKeydown) return; // already open

  previouslyFocused = document.activeElement;
  priorBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  modal.removeAttribute('hidden');

  wirePicker(modal);
  currentPick = onPick;
  // Reset state on each open so a previous pick doesn't carry over.
  modal.dispatchEvent(new CustomEvent('country-modal:reset'));

  // Focus the trigger so the user can use the keyboard immediately.
  modal.querySelector<HTMLButtonElement>('[data-country-trigger]')?.focus();

  // Focus trap + Escape (closes the open list, never the modal).
  activeKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeMenu?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (focusables.length === 0) return;
    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };
  document.addEventListener('keydown', activeKeydown, true);
}

export function closeCountryModal(): void {
  const modal = document.querySelector<HTMLElement>('[data-country-modal]');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = priorBodyOverflow;
  if (activeKeydown) {
    document.removeEventListener('keydown', activeKeydown, true);
    activeKeydown = null;
  }
  if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  previouslyFocused = null;
}
