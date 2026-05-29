import type { Country } from './types';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let activeKeydown: ((e: KeyboardEvent) => void) | null = null;
let priorBodyOverflow = '';
let previouslyFocused: Element | null = null;

export function openCountryModal(onPick: (country: Country) => void): void {
  const modal = document.querySelector<HTMLElement>('[data-country-modal]');
  if (!modal) return;
  if (activeKeydown) return; // already open

  previouslyFocused = document.activeElement;
  priorBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  modal.removeAttribute('hidden');

  const select = modal.querySelector<HTMLSelectElement>('[data-country-select]');
  const submit = modal.querySelector<HTMLButtonElement>('[data-country-submit]');
  if (!select || !submit) return;

  // Reset state on each open so a previous pick doesn't carry over.
  select.value = '';
  submit.disabled = true;

  const onChange = () => { submit.disabled = !select.value; };
  const onSubmit = () => {
    const c = select.value as Country | '';
    if (!c) return;
    closeCountryModal();
    onPick(c);
  };
  select.addEventListener('change', onChange);
  submit.addEventListener('click', onSubmit, { once: true });

  // Focus the select so the user can use the keyboard immediately.
  select.focus();

  // Focus trap + block Escape.
  activeKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (e.key !== 'Tab') return;
    const focusables = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter(el => !el.hasAttribute('disabled'));
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
