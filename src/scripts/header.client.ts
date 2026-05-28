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

  // Derived state: header is opaque if EITHER condition is true.
  //   overLightPanel — user has scrolled into a [data-light-bg] snap panel
  //   megaOpen       — the desktop mega-nav panel is currently hovered/open
  // Non-snap pages keep their existing "always opaque" behaviour; the recompute
  // path still works because both flags being false on a non-snap page is
  // irrelevant — we set opaque(true) up-front and never recompute there.
  let overLightPanel = false;
  let megaOpen = false;
  const recompute = () => setOpaque(overLightPanel || megaOpen);

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
          overLightPanel = visible.size > 0;
          recompute();
        },
        // Only count as "visible" once a light panel reaches the top 40% of the
        // viewport — i.e. it's the panel currently being snapped to.
        { threshold: 0, rootMargin: '0px 0px -60% 0px' },
      );
      for (const p of lightPanels) observer.observe(p);
    }

    // Mega-nav: when the panel is open over a transparent (dark-hero) section
    // the header bar would otherwise float above a different surface. Flip it
    // opaque while the panel is open so the bar and panel read as one block.
    document.addEventListener('meganav:state', (e) => {
      megaOpen = (e as CustomEvent<{ open: boolean }>).detail.open;
      recompute();
    });
  } else {
    // Non-snap pages: opaque from the start (no transparent hero behind the
    // header, so transparency would just show the white body color).
    setOpaque(true);
  }
}
