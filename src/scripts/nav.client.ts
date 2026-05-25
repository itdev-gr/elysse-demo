// Desktop: hover + click + keyboard for the PrimaryNav dropdowns.
const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-group]'));

function setOpen(group: HTMLElement, open: boolean) {
  const btn = group.querySelector<HTMLButtonElement>('[data-nav-trigger]');
  const panel = group.querySelector<HTMLElement>('[data-nav-panel]');
  if (!btn || !panel) return;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.classList.toggle('opacity-0', !open);
  panel.classList.toggle('invisible', !open);
  panel.classList.toggle('translate-y-1', !open);
  panel.classList.toggle('opacity-100', open);
  panel.classList.toggle('visible', open);
  panel.classList.toggle('translate-y-0', open);
}

function closeAll(except?: HTMLElement) {
  for (const g of groups) {
    if (g === except) continue;
    setOpen(g, false);
  }
}

for (const g of groups) {
  const btn = g.querySelector<HTMLButtonElement>('[data-nav-trigger]');
  if (!btn) continue;

  g.addEventListener('mouseenter', () => {
    closeAll(g);
    setOpen(g, true);
  });
  g.addEventListener('mouseleave', () => setOpen(g, false));

  btn.addEventListener('click', () => {
    // Always open on click (mouseenter may have already opened it;
    // click-to-close is handled by the document click-outside listener).
    closeAll(g);
    setOpen(g, true);
  });

  btn.addEventListener('focus', () => {
    closeAll(g);
    setOpen(g, true);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

document.addEventListener('click', (e) => {
  const target = e.target as Node;
  if (!groups.some((g) => g.contains(target))) closeAll();
});
