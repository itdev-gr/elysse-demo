-- Seed the 5 blog teasers from site-content.ts as full posts.
-- Idempotent: re-running this against existing rows is a no-op (slug is unique).
insert into public.posts (slug, title, excerpt, body, author, published_at, reading_minutes, is_published)
values
(
  'zeeflex-fittings-pool-plumbing',
  'The Ultimate Solution for Pool Plumbing: ZEEFLEX fittings',
  'ZEEFLEX fittings by Elysée offer a reliable, leak-free solution for connecting flexible PVC pool hoses. Designed for 50 mm and 63 mm hoses, they combine easy installation with exceptional durability in demanding pool environments.',
  E'Pool installations live and die by the seal at every joint. A drip behind a tile, a slow weep at a manifold — small leaks compound into expensive callbacks and unhappy customers. ZEEFLEX fittings were designed to remove that risk.\n\nDeveloped specifically for **flexible PVC pool hoses** in 50 mm and 63 mm sizes, ZEEFLEX uses a barbed inner profile that locks into the hose wall, paired with a captive clamp that distributes pressure evenly around the full circumference. The result is a connection that resists creep under thermal cycling and chlorine exposure — the two failure modes most common in pool plumbing.\n\nWhat makes ZEEFLEX different in practice:\n\n- Single-pass installation: no separate primer, no two-part adhesive cure window\n- Compatible with both rigid PVC fittings and flexible hose runs\n- Field-serviceable: the captive clamp can be released and re-tensioned without cutting the hose\n- Tested for continuous service in chlorinated and salt-treated water\n\nFor pool builders working through tight installation windows in the high season, ZEEFLEX cuts the time per joint to under a minute while raising the confidence interval on every connection. For the homeowner downstream, it means a pool circuit that simply works — for years.',
  'Elysée Group',
  now(),
  3,
  true
),
(
  'elysee-zero-force-range-improved',
  'Meet the New and Improved Elysée Zero Force Range',
  'The new Elysée Zero Force range (75mm–110mm) has been upgraded with refined technology designed to make pipe installation faster, easier and more efficient. Its innovative semi push-fit system allows installers to insert pipes with zero insertion force after loosening the cap just one turn.',
  E'Installing large-diameter pipes has always been a wrestling match. Forcing a 110 mm pipe end into a tight rubber gasket takes leverage, patience, and a steady knee. The Elysée Zero Force range was created to end that fight — and the new generation makes it dramatically better.\n\nThe principle is simple. Loosen the cap one turn. The internal gasket relaxes. The pipe slides in with zero insertion force. Tighten the cap back. Done.\n\n## What is new in the upgraded range\n\n- **Refined gasket geometry** in the 75 mm, 90 mm and 110 mm sizes — sealing pressure is higher, but insertion force in the open position is now effectively zero\n- **Re-machined cap thread** for smoother engagement and a defined torque stop, so installers know when they are fully seated\n- **Updated body profile** that fits a wider range of fitting walls without the need for adapters\n\n## Why it matters on site\n\nA single Zero Force joint now takes seconds rather than minutes. On a multi-storey riser or a long horizontal manifold, that compounds across hundreds of joints into days of saved labour. And because the seal compression is independent of how hard the pipe was pushed in, the leak rate on commissioning drops to near zero — the seal is set by the cap, not by the installer.\n\nThe range is fully compatible with Elysée''s existing PVC product family. Drop-in replacement for legacy fittings; no system redesign needed.',
  'Elysée R&D Team',
  now(),
  3,
  true
),
(
  'elysee-global-transition-range',
  'The Ultimate Connection: Why the Elysée Global Transition Range is a Game-Changer',
  'The Elysée Global Transition Range offers a universal solution for connecting different pipe materials, eliminating the need for multiple adapters and simplifying installations.',
  E'Real-world piping systems are never made of one material. Mains might be ductile iron, the rising pipe steel, the in-building distribution PE, the final connection PVC. Every interface between materials has historically meant a different adapter, a different gasket profile, a different inventory line.\n\nThe Elysée Global Transition Range collapses that complexity into a single family of fittings designed to **connect across material boundaries**.\n\n## What it covers\n\nOne range, multiple transitions:\n\n- PE to PVC\n- PE to ductile iron\n- PVC to steel\n- PE / PVC to copper for the final tail-piece on building services\n\nEach fitting in the range uses a common body geometry with material-specific inserts and seals, calibrated to the wall thickness and surface finish of the partner pipe. The installer carries one range, not five.\n\n## Why this is a game-changer\n\n- **Inventory:** distributors and installers reduce their SKU count substantially\n- **Field time:** no time lost identifying the right adapter from a confused mix on the van\n- **Reliability:** all transitions share the same proven seal architecture, which means a single quality bar across every connection in the system\n- **Engineering:** designers can specify a continuous Elysée system from the property boundary all the way to the appliance, with documented transition fittings at every material change\n\nThe Global Transition Range is what happens when a manufacturer stops thinking in product silos and starts thinking in installed systems.',
  'Elysée Group',
  now(),
  3,
  true
),
(
  'pvc-fittings-for-waste-and-soil-systems',
  'PVC Fittings and Pipes for Waste and Soil Systems',
  'Elysée Piping offers a comprehensive range of uPVC pipes and fittings designed for safe, hygienic and long-lasting soil and waste disposal systems. Manufactured from lead-free PVC-U and fully compliant with European standards EN 1329 and EN 1401.',
  E'Soil and waste systems are infrastructure you never want to think about — and that is exactly why they have to be designed and built to outlast everything else in a building. Elysée''s uPVC range exists for that brief.\n\n## What is in the range\n\nA full system, from house drainage through to underground sewer connection:\n\n- **Above-ground soil pipes and fittings** in the dimensions required by EN 1329, for stack and branch installations inside the building\n- **Underground sewer pipes and fittings** built to EN 1401, with SDR and stiffness classes selected for the trench loads typical of residential and light-commercial sites\n- **Inspection and access fittings** — rodding eyes, access chambers, single and double junctions — for the maintenance points that every code-compliant system needs\n\n## Material and compliance\n\nAll pipes and fittings are manufactured from **lead-free PVC-U**. This matters for two reasons:\n\n1. **Hygiene and environment:** lead-free formulation removes a long-standing concern about leachate and end-of-life handling\n2. **Compliance:** the range meets both EN 1329 (above-ground) and EN 1401 (below-ground) — covering the full range of relevant European standards in one product family\n\n## Why it lasts\n\nuPVC has been the workhorse material of drainage for decades because it does not corrode, does not scale, and does not depend on protective coatings to do its job. Elysée''s formulation is tuned for high-temperature greywater resistance and impact toughness at low ambient temperatures, so the same pipe stack performs from southern Cyprus through to northern installations.\n\nThe net result: a quietly invisible drainage system that does its job for the full design life of the building.',
  'Elysée Group',
  now(),
  3,
  true
),
(
  'elysee-irrigation-great-place-to-work',
  'Elysée Irrigation Certified as a Great Place To Work',
  'Elysée Irrigation was certified as a Great Place To Work®, confirming its commitment to creating a modern, safe, and people-centered working environment, where trust, respect, and the development of its people are at the core.',
  E'We are proud to announce that **Elysée Irrigation** has been officially certified as a *Great Place To Work®*. The certification is awarded after an independent assessment of company culture against a strict set of trust-based criteria, anchored in the experience of the employees themselves.\n\n## What the certification recognises\n\nThe assessment looks at the company from the inside out. It is the staff who fill in the survey, and it is their lived experience that determines whether the certification is granted. For Elysée Irrigation, the result confirms what we work for every day:\n\n- **Trust** between teams and across hierarchy levels\n- **Respect** for the role every individual plays in the success of the business\n- **Development** through training, internal moves, and long careers within the group\n- **Safety** as a non-negotiable across every site and every shift\n- **A modern working environment** that supports both the technical complexity of irrigation manufacturing and the human side of long careers\n\n## What this means for the wider group\n\nElysée Irrigation is one of several subsidiaries inside the Elysée Group. The certification is a milestone for the irrigation business specifically — and a benchmark we are committed to extending across every part of the group, from manufacturing in Cyprus to subsidiaries in Lebanon, Egypt and Austria.\n\nWe hire people, not seats. This certification is independent confirmation that the people who join us experience exactly that.',
  'Elysée Group',
  now(),
  3,
  true
)
on conflict (slug) do nothing;
