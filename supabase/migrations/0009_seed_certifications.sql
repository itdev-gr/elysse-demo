-- Seed: current hardcoded certifications so both pages render identically on
-- day one. Data copied verbatim from src/data/site-content.ts
-- (greenCertificationItems) and the quality-certifications page (pillars +
-- categoryImages). Idempotent: skips a group if it already has rows.
insert into public.certifications
  (cert_group, name, description, scope, tag, logo, pdf_url, sort_order)
select * from (values
  ('green', 'ISO 14001', 'Environmental Management System',
   'Systematic management of environmental responsibilities across all operations.',
   null, '/images/certifications/iso-14001.svg',
   'https://elysee.com.cy/uploads/originals/249/cys-en-iso-14001-eng-P3D42.pdf', 1),
  ('green', 'ISCC PLUS', 'International Sustainability and Carbon Certification',
   'Traceability of sustainable and recycled raw materials through the supply chain.',
   null, '/images/certifications/iscc-plus.svg',
   'https://elysee.com.cy/uploads/originals/249/certificate-2025.pdf', 2),
  ('green', 'ISO 14064-3:2019', 'Greenhouse Gas Validation and Verification',
   'Independent verification of greenhouse-gas emission statements.',
   null, '/images/certifications/iso-14064-3.svg',
   'https://elysee.com.cy/uploads/originals/249/iso14064-year-2024-qZNLq.pdf', 3),
  ('green', 'EMAS 2024', 'EU Eco-Management and Audit Scheme',
   'Public environmental statement audited under EU EMAS Regulation.',
   null, '/images/certifications/emas.svg',
   'https://elysee.com.cy/uploads/originals/249/emas-2024-2020122026-agglika-id-394469.pdf', 4),
  ('green', 'CYS EN ISO 50001:2018', 'Energy Management System',
   'Continual improvement of energy performance across production sites.',
   null, '/images/certifications/iso-50001.svg',
   'https://elysee.com.cy/uploads/originals/249/cys-en-iso-5000132018-2020122026-agglika-id-394473.pdf', 5),
  ('green', 'Environmental Declaration 2024', 'Annual environmental performance report',
   'Annual disclosure of environmental performance, audited and published.',
   null, '/images/certifications/environmental-declaration.svg',
   'https://elysee.com.cy/uploads/originals/249/enviromental-declaration-2024-11WmU.pdf', 6),
  ('quality', 'Management System',
   'ISO 9001 quality management — certified since 1998 and renewed continuously.',
   null, 'MGMT', '/images/certifications/categories/management-system.png', null, 1),
  ('quality', 'General',
   'Cross-product certifications from internationally recognised bodies including DVGW, KIWA, SII and OVGW.',
   null, 'GEN', '/images/certifications/categories/general.png', null, 2),
  ('quality', 'Compression Fittings',
   'Product certifications covering the full Elysée compression-fitting range for water-supply applications.',
   null, 'CF', '/images/certifications/categories/compression-fittings.png', null, 3),
  ('quality', 'PE Pipes',
   'Polyethylene pipe certifications across the manufactured diameter range, suitable for potable water, gas and industrial fluids.',
   null, 'PE', '/images/certifications/categories/pe-pipes.png', null, 4),
  ('quality', 'PVC Pipes',
   'PVC pipe certifications for water-supply, drainage and infrastructure applications.',
   null, 'PVC', '/images/certifications/categories/pvc-pipes.png', null, 5),
  ('quality', 'Green Elysée',
   'Environmental and sustainability certifications attached to the Green Elysée product line.',
   null, 'GRN', '/images/certifications/categories/green-elysee.jpg', null, 6)
) as seed(cert_group, name, description, scope, tag, logo, pdf_url, sort_order)
where not exists (
  select 1 from public.certifications c where c.cert_group = seed.cert_group
);
