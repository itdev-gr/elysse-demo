-- Quality certifications, corrected: the 'quality' group manages the
-- individual certificates inside each fixed category (mirroring
-- elysee.com.cy/quality-certifications-en -> per-category pages), not the
-- 6 category cards themselves. The category cards are a fixed taxonomy
-- rendered statically; the Green Elysée category links to the green group.

alter table public.certifications alter column description drop not null;
alter table public.certifications add column if not exists category text;

alter table public.certifications drop constraint if exists certifications_category_check;
alter table public.certifications add constraint certifications_category_check
  check (
    category is null
    or category in ('management-system','general','compression-fittings','pe-pipes','pvc-pipes')
  );

create index if not exists certifications_quality_category_idx
  on public.certifications (cert_group, category, sort_order);

-- Remove the wrongly-seeded "category card" rows (quality rows without a category).
delete from public.certifications where cert_group = 'quality' and category is null;

-- Seed the real certificates, mirrored from the live elysee.com.cy pages.
-- Idempotent: skips if any quality certificates already exist.
insert into public.certifications (cert_group, category, name, description, pdf_url, sort_order)
select * from (values
  ('quality', 'management-system', 'CYS EN ISO 9001:2015', 'Quality management system', 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-90012015-eng-kBb3u.pdf', 1),
  ('quality', 'management-system', 'CYS EN ISO 14001', 'Environmental management system', 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-14001-eng.pdf', 2),
  ('quality', 'management-system', 'ISO 45001', 'Occupational health & safety management', 'https://elysee.com.cy/uploads/originals/249/iso-45001-eng.pdf', 3),
  ('quality', 'management-system', 'Integrated Management System Policy', 'Company policy covering quality, environmental, and safety management', 'https://elysee.com.cy/uploads/originals/249/integrated-management-system-policy.pdf', 4),
  ('quality', 'management-system', 'EMAS 2024', 'EU Eco-Management and Audit Scheme (Regulation 1221/2009)', 'https://elysee.com.cy/uploads/originals/249/emas-2024-2020122026-agglika-id-394469-mQoSw.pdf', 5),
  ('quality', 'management-system', 'Environmental Declaration 2024', 'Annual environmental performance statement', 'https://elysee.com.cy/uploads/originals/249/enviromental-declaration-2024-5xnre.pdf', 6),
  ('quality', 'management-system', 'CYS EN ISO 50001:2018', 'Energy management system', 'https://elysee.com.cy/uploads/originals/249/cys-en-iso-5000132018-2020122026-agglika-id-394473-45GgF.pdf', 7),
  ('quality', 'general', 'ANAD Productivity Improvement', null, 'https://elysee.com.cy/uploads/originals/1/anad-productivity-improvment.pdf', 1),
  ('quality', 'general', 'Green Dot Elysée', null, 'https://elysee.com.cy/uploads/originals/249/green-dot-elysee.pdf', 2),
  ('quality', 'compression-fittings', 'KIWA Certificate PP Clamp Fittings', null, 'https://elysee.com.cy/uploads/originals/249/kiwa-elysee-102044-02.pdf', 1),
  ('quality', 'compression-fittings', 'Czech Certificate', null, 'https://elysee.com.cy/uploads/originals/249/czech-itc-certificate-eng.pdf', 2),
  ('quality', 'compression-fittings', 'WRAS Certificate', null, 'https://elysee.com.cy/uploads/originals/249/elysee-wras-certificate-final.pdf', 3),
  ('quality', 'compression-fittings', 'SAI Certificate', null, 'https://elysee.com.cy/uploads/originals/249/certificate-smk26038-20230712.pdf', 4),
  ('quality', 'compression-fittings', 'OFI Certificate EN 12201-3', null, 'https://elysee.com.cy/uploads/originals/249/elysee-en12201-3-until-2026.pdf', 5),
  ('quality', 'compression-fittings', 'OVGW Certificate', null, 'https://elysee.com.cy/uploads/originals/249/ovgw-certificate-3H0eU.pdf', 6),
  ('quality', 'compression-fittings', 'DVGW Elysée', null, 'https://elysee.com.cy/uploads/originals/249/dvgw-elysee-WMF8U.pdf', 7),
  ('quality', 'compression-fittings', 'OFI Certificate ISO 17885', null, 'https://elysee.com.cy/uploads/originals/249/elysee-iso17885.pdf', 8),
  ('quality', 'compression-fittings', 'SVGW Certificate', null, 'https://elysee.com.cy/uploads/originals/249/svgw-zert-1810-6790-certificate-24-e.pdf', 9),
  ('quality', 'compression-fittings', 'Elysée Zero Force', null, 'https://elysee.com.cy/uploads/originals/249/dvgw-zero-force-20mm-upto-110mm-exp-2029.pdf', 10),
  ('quality', 'compression-fittings', 'DVGW Elysée Push Fit', null, 'https://elysee.com.cy/uploads/originals/249/dvgw-push-fit-certificate-2025-d5Vqe.pdf', 11),
  ('quality', 'compression-fittings', 'BDS ISO 17885:2022', null, 'https://elysee.com.cy/uploads/originals/249/bulgarkontrola-until-3-8-2026-eng.pdf', 12),
  ('quality', 'compression-fittings', 'SII Elysée Rohrsysteme Zero Force', null, 'https://elysee.com.cy/uploads/originals/249/sii-elysee-roahrsystem-certificate-2026-pn10-pn16-zf-b8p4z.pdf', 13),
  ('quality', 'compression-fittings', 'WRAS Elysée Epsilon Series', null, 'https://elysee.com.cy/uploads/originals/249/wras-certificate-elysee-e-series-2207346-until-2027.pdf', 14),
  ('quality', 'compression-fittings', 'Poland ITB', null, 'https://elysee.com.cy/uploads/originals/249/poland.pdf', 15),
  ('quality', 'compression-fittings', 'Poland PZH Certificate', null, 'https://elysee.com.cy/uploads/originals/249/pzh-certificate-until-111026.pdf', 16),
  ('quality', 'compression-fittings', 'SAI WaterMark Certificate', null, 'https://elysee.com.cy/uploads/originals/249/watermark-certno-wmk260385-eyCcC.pdf', 17),
  ('quality', 'compression-fittings', 'Elysée AgriFlow', null, 'https://elysee.com.cy/uploads/originals/249/nsai-1613-uppercross-enterprises-limited-certificate-2025.pdf', 18),
  ('quality', 'compression-fittings', 'ÖA Registration Certificate', null, 'https://elysee.com.cy/uploads/originals/249/a-zertifikat-elysee-rohrsysteme.pdf', 19),
  ('quality', 'compression-fittings', 'Slovakia Certificate', null, 'https://elysee.com.cy/uploads/originals/249/slovakia-vusapl-certificate-2026-1.pdf', 20),
  ('quality', 'pe-pipes', 'EN 12201-2', 'HDPE pipes according to EN 12201', 'https://elysee.com.cy/uploads/originals/249/en-12201-2-7-ofi-2025.pdf', 1),
  ('quality', 'pe-pipes', 'AENOR Certificate ISO 15875', null, 'https://elysee.com.cy/uploads/originals/249/ce001marcan007535-in-2025-07-16.pdf', 2),
  ('quality', 'pe-pipes', 'WRAS Certificate Stop Valves', null, 'https://elysee.com.cy/uploads/originals/249/wras-stop-valves-certificate-all.pdf', 3),
  ('quality', 'pe-pipes', 'CYS 106', 'LDPE pipes according to CYS 106', 'https://elysee.com.cy/uploads/originals/249/cys-106.pdf', 4),
  ('quality', 'pvc-pipes', 'EN 1401', 'Underground drainage and sewage', 'https://elysee.com.cy/uploads/originals/249/en-1401-24112027.pdf', 1),
  ('quality', 'pvc-pipes', 'EN 1329', 'Soil and waste discharge', 'https://elysee.com.cy/uploads/originals/249/en-1329-1-elysee-until-06072028.pdf', 2),
  ('quality', 'pvc-pipes', 'EN ISO 1452', 'Pressure water supply, sewage and drainage', 'https://elysee.com.cy/uploads/originals/249/en-iso-1452-certificate.pdf', 3),
  ('quality', 'pvc-pipes', 'EN 61386', 'Conduit pipes', 'https://elysee.com.cy/uploads/originals/249/en-61386-cert-until-19-11-2030-cqk6w.pdf', 4)
) as seed(cert_group, category, name, description, pdf_url, sort_order)
where not exists (
  select 1 from public.certifications c where c.cert_group = 'quality'
);
