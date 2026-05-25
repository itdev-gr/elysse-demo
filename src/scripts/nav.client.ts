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


}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

document.addEventListener('click', (e) => {
  const target = e.target as Node;
  if (!groups.some((g) => g.contains(target))) closeAll();
});

// Mobile: hamburger drawer + single-open accordion.
const mobileTrigger = document.querySelector<HTMLButtonElement>('[data-mobile-trigger]');
const mobileRoot = document.querySelector<HTMLElement>('[data-mobile-root]');
const mobileBackdrop = document.querySelector<HTMLElement>('[data-mobile-backdrop]');
const mobileDrawer = document.querySelector<HTMLElement>('[data-mobile-drawer]');
const mobileClose = document.querySelector<HTMLButtonElement>('[data-mobile-close]');
const mobileAccTriggers = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-mobile-acc-trigger]'),
);

if (mobileTrigger && mobileRoot && mobileBackdrop && mobileDrawer && mobileClose) {
  const openDrawer = () => {
    mobileRoot.classList.remove('hidden');
    requestAnimationFrame(() => {
      mobileBackdrop.classList.add('opacity-100');
      mobileBackdrop.classList.remove('opacity-0');
      mobileDrawer.classList.remove('translate-x-full');
      mobileDrawer.classList.add('translate-x-0');
    });
    mobileTrigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileClose.focus();
  };

  const closeDrawer = () => {
    mobileBackdrop.classList.remove('opacity-100');
    mobileBackdrop.classList.add('opacity-0');
    mobileDrawer.classList.add('translate-x-full');
    mobileDrawer.classList.remove('translate-x-0');
    mobileTrigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(() => mobileRoot.classList.add('hidden'), 320);
    mobileTrigger.focus();
  };

  mobileTrigger.addEventListener('click', () => {
    if (mobileTrigger.getAttribute('aria-expanded') === 'true') closeDrawer();
    else openDrawer();
  });
  mobileClose.addEventListener('click', closeDrawer);
  mobileBackdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileTrigger.getAttribute('aria-expanded') === 'true') {
      closeDrawer();
    }
  });
}

for (const btn of mobileAccTriggers) {
  btn.addEventListener('click', () => {
    const panelId = btn.getAttribute('aria-controls');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';

    for (const other of mobileAccTriggers) {
      if (other === btn) continue;
      const otherId = other.getAttribute('aria-controls');
      const otherPanel = otherId ? document.getElementById(otherId) : null;
      other.setAttribute('aria-expanded', 'false');
      if (otherPanel) otherPanel.classList.add('hidden');
      other.querySelector('[data-mobile-acc-icon]')?.classList.remove('rotate-180');
    }

    btn.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
    panel.classList.toggle('hidden', wasOpen);
    btn.querySelector('[data-mobile-acc-icon]')?.classList.toggle('rotate-180', !wasOpen);
  });
}
