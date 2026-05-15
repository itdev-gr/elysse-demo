const header = document.querySelector<HTMLElement>('[data-header]');
const trigger = document.querySelector<HTMLButtonElement>('[data-menu-trigger]');
const root = document.querySelector<HTMLElement>('[data-menu-root]');
const backdrop = document.querySelector<HTMLElement>('[data-menu-backdrop]');
const drawer = document.querySelector<HTMLElement>('[data-menu-drawer]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-menu-link]'));

if (header) {
  const setOpaque = (opaque: boolean) => {
    header.dataset.opaque = opaque ? 'true' : 'false';
    header.classList.toggle('bg-surface/90', opaque);
    header.classList.toggle('backdrop-blur-md', opaque);
    header.classList.toggle('shadow-sm', opaque);
    // Invert text colour over the transparent (over-hero) state so logo/menu
    // remain legible against the dark hero image.
    header.classList.toggle('text-ink', opaque);
    header.classList.toggle('text-surface', !opaque);
  };

  const isSnapPage = document.documentElement.hasAttribute('data-snap-page');

  if (isSnapPage) {
    // Snap pages: panels are full-bleed under the header. Stay transparent
    // over dark panels; flip opaque over any [data-light-bg] panel so logo/menu
    // stay legible.
    setOpaque(false);
    const lightPanels = Array.from(
      document.querySelectorAll<HTMLElement>('[data-snap][data-light-bg]'),
    );
    if (lightPanels.length) {
      const visible = new Set<Element>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          setOpaque(visible.size > 0);
        },
        // Only count as "visible" once a light panel reaches the top 40% of the
        // viewport — i.e. it's the panel currently being snapped to.
        { threshold: 0, rootMargin: '0px 0px -60% 0px' },
      );
      for (const p of lightPanels) observer.observe(p);
    }
  } else {
    // Non-snap pages: opaque from the start (no transparent hero behind the
    // header, so transparency would just show the white body color).
    setOpaque(true);
  }
}

if (trigger && root && backdrop && drawer && closeBtn) {
  let lastFocus: HTMLElement | null = null;

  const open = () => {
    lastFocus = document.activeElement as HTMLElement | null;
    root.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.add('opacity-100', 'bg-brand-500/40');
      backdrop.classList.remove('bg-brand-500/0');
      drawer.classList.remove('translate-y-2', 'opacity-0');
      drawer.classList.add('translate-y-0', 'opacity-100');
    });
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    (links[0] ?? closeBtn).focus();
  };
  const close = () => {
    backdrop.classList.remove('opacity-100', 'bg-brand-500/40');
    backdrop.classList.add('bg-brand-500/0');
    drawer.classList.remove('translate-y-0', 'opacity-100');
    drawer.classList.add('translate-y-2', 'opacity-0');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(() => root.classList.add('hidden'), 320);
    lastFocus?.focus();
  };

  trigger.addEventListener('click', () => {
    trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') close();
  });

  // Basic focus trap inside drawer
  const focusable = () => Array.from(drawer.querySelectorAll<HTMLElement>(
    'a, button, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.hasAttribute('disabled'));
  drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
