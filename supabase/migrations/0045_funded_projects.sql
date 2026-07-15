-- public.funded_projects: backing table for the admin Funded Research Projects
-- dashboard. Mirrors public.research_posts (0042) but carries the project-specific
-- metadata (status, duration, funding, partners) that the listing/detail pages
-- render. Published at /innovation/funded-research-projects/ and .../<slug>/.
create table if not exists public.funded_projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique
                   check (slug ~ '^[a-z0-9-]+$'),
  name           text not null,
  status         text not null default 'Ongoing'
                   check (status in ('Ongoing', 'Completed')),
  duration       text not null,
  total_funding  text not null,
  elysee_funding text,
  partners       text[] not null default '{}',
  image          text,
  image_alt      text,
  excerpt        text not null,
  body           text not null default '',
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Ongoing before Completed; within a status, editor-defined order then age.
create index if not exists funded_projects_published_idx
  on public.funded_projects (is_published, status, sort_order);

-- Reuse the set_updated_at() trigger function created in 0001_jobs.sql.
drop trigger if exists set_funded_projects_updated_at on public.funded_projects;
create trigger set_funded_projects_updated_at
  before update on public.funded_projects
  for each row execute function public.set_updated_at();

-- RLS
alter table public.funded_projects enable row level security;

drop policy if exists "public read published funded_projects" on public.funded_projects;
create policy "public read published funded_projects"
on public.funded_projects for select
to anon, authenticated
using (is_published = true);

drop policy if exists "authenticated full access on funded_projects" on public.funded_projects;
create policy "authenticated full access on funded_projects"
on public.funded_projects for all
to authenticated
using (true) with check (true);

-- Storage: bucket for project logos.
insert into storage.buckets (id, name, public)
values ('project-logos', 'project-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read project-logos" on storage.objects;
create policy "public read project-logos"
on storage.objects for select to anon, authenticated
using (bucket_id = 'project-logos');

drop policy if exists "authenticated write project-logos" on storage.objects;
create policy "authenticated write project-logos"
on storage.objects for insert to authenticated
with check (bucket_id = 'project-logos');

drop policy if exists "authenticated update project-logos" on storage.objects;
create policy "authenticated update project-logos"
on storage.objects for update to authenticated
using (bucket_id = 'project-logos');

drop policy if exists "authenticated delete project-logos" on storage.objects;
create policy "authenticated delete project-logos"
on storage.objects for delete to authenticated
using (bucket_id = 'project-logos');

-- Seed: the three projects that previously lived in site-content.ts, verbatim.
-- Logos reference the existing files under /public/images/innovation/projects/.
-- Idempotent — only seeds when the table is empty.
insert into public.funded_projects
  (slug, name, status, duration, total_funding, elysee_funding, partners, image, image_alt, excerpt, body, sort_order)
select * from (values
  (
    'innova', 'Innova', 'Ongoing', '1/8/2025 – 30/4/2026', '€196,125', null::text, '{}'::text[],
    '/images/innovation/projects/innova.png', 'Innova project logo',
    $ex$The funded project introduces the development of a Next-Generation Mini Valve for irrigation systems, developed by Elysée Irrigation Ltd., combining two patented innovations for low-pressure irrigation applications.$ex$,
    $md$Proposal Number: FTI/0325/0006

## Project Summary

The funded project introduces the development of a Next-Generation Mini Valve for irrigation systems, developed by Elysée Irrigation Ltd. The project combines two patented innovations - the double injection molded sealing system and the Dripline quick-connection technology - to create an optimized irrigation product. The invention is intended for low-pressure irrigation applications and began on 1/8/2025 with a nine-month duration.

## Project Objectives

- Development of a Next-Generation Mini Valve for irrigation purposes
- Incorporation of two patented features held by Elysee Irrigation (Dripline connection feature and double injection molded sealing system)
- Outstanding performance metrics: higher flow, better mechanical properties, improved sealing at higher operating pressures$md$,
    0
  ),
  (
    'agrecomposites', 'AgReCOMPOSITES', 'Ongoing', '2/5/2024 – 1/5/2026', '€598,046', '€221,130', '{}'::text[],
    '/images/innovation/projects/agrecomposites.png', 'AgReCOMPOSITES project logo',
    $ex$The project aims to the development of innovative and sustainable polymer composites in the form of novel plastic products mainly for irrigation and water supply.$ex$,
    $md$Proposal Number: CODEVELOP-AG-SH-HE/0823/0140

## Project Summary

The project AgReCOMPOSITES falls under the Pillar I 'Smart Growth' that constitutes one of the three strategy pillars of the Restart 2016-2020 Programmes of the Research and Innovation Foundation (RIF), and it is fully compatible with S3CY 'Agriculture- Food Industry' priority sector.

The Host Organization of the project is Elysee.

Carbon-based polymer composites are replacing many conventional materials due to their enhanced thermomechanical properties in various applications. Although, carbon-based fillers, including carbon nanotubes, carbon nano-fibers and graphene that are typically employed as additives, are not environmentally and economically viable.

Thus, one of the project objectives is to develop sustainable, cost- effective and environmentally viable polymer composites. The latter is going to be achieved by incorporating biochar-based fillers deriving from pyrolysis of agricultural and livestock wastes.

The project aims to the development of innovative and sustainable polymer composites in the form of novel plastic products mainly for irrigation and water supply.

## Project Objectives

The main objective of the AgReComposites project is the employment of biochar-based additives in Polypropylene (PP) and Polyethylene (PE) virgin thermoplastics and thermoplastic recyclates for the fabrication of 'green' plastic pipes and fittings.

Furthermore, another important objective, is the enhancement of an effective collaboration between enterprises and research community, that aims to identify challenges and to develop new sustainable solutions by implementing R&D projects.

## Funding Agencies

The Project CODEVELOP-AG-SH-HE/0823/0140 is funded by the European Union - NextGenerationEU, through the Research and Innovation Foundation.$md$,
    1
  ),
  (
    'plantngreen', 'PlantNGreen', 'Completed', '01/02/2023 – 31/01/2025', '€574,142.25', '€222,878.25',
    array[
      'University of Cyprus (UCY/HO) — Host Organisation',
      'Cyprus University of Technology (CUT/PA1)',
      'Elysee Irrigation Ltd. (Elysee/PA2)',
      'Advanced Materials Design & Manufacturing Limited / AmaDema (AMDM/PA3)'
    ]::text[],
    '/images/innovation/projects/plantngreen.png', 'PlantNGreen project logo',
    $ex$The primary objective of PlantNGreen is the development of innovative biodegradable nano/microfibrous "green" plant nursery bags, functionalized with selected plant growth promoters for use in ecological seedlings cultivation.$ex$,
    $md$Development of green-tech functionalized, biodegradable fibrous plant nursery bags in ecological seedlings cultivation

Proposal Number: CODEVELOP-GT/0322/033

## Project Summary

Plant nursery bags that are typically used in seedlings production mainly consist of low-density polyethylene which is a non-biodegradable plastic material. As a consequence, upon seedling planting, a large amount of plastic waste ends up in the environment. The primary objective of PlantNGreen is the development of innovative biodegradable nano/microfibrous "green" plant nursery bags that will further functionalized with selected plant growth promoters for use in ecological seedlings cultivation, thus promoting both, environmental protection and seedlings growth promotion. The implementation of this project will be based on a strong and effective collaboration to be established between the 2 public academic institutions in Cyprus and 2 local enterprises.

## Project Objectives

PlantNGreen is fully compatible with the specific objectives of the CO-DEVELOP Programme and the Green Transition priority area, as well as with the Priority Sector (S3Cy) of ''Sustainable Growth-Environment'' an extremely important Sector of Priority.

- Host Organisation: University of Cyprus (UCY/HO)
- Cyprus University of Technology (CUT/PA1)
- Elysee Irrigation Ltd. (Elysee/PA2)
- Advanced Materials Design & Manufacturing Limited / AmaDema (AMDM/PA3)
- Expertise areas spanned: materials engineering, polymer processing/electrospinning, plant physiology, irrigation systems

This inter-disciplinary partnership ensures the successful project implementation resulting to a highly significant research/technological output.

## Funding Agencies

The Project CODEVELOP-GT/0322/033 is funded by the European Union - NextGenerationEU, through the Research and Innovation Foundation.$md$,
    0
  )
) as seed(slug, name, status, duration, total_funding, elysee_funding, partners, image, image_alt, excerpt, body, sort_order)
where not exists (select 1 from public.funded_projects);
