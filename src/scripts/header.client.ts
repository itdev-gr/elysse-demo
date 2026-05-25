const header = document.querySelector<HTMLElement>('[data-header]');

if (header) {
  const setOpaque = (opaque: boolean) => {
    header.dataset.opaque = opaque ? 'true' : 'false';
    header.classList.toggle('bg-surface/90', opaque);
    header.classList.toggle('backdrop-blur-md', opaque);
    header.classList.toggle('shadow-sm', opaque);
    // Invert text colour over the transparent (over-hero) state so logo/nav
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
