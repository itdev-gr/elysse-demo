-- "Latest from Elysée" home section curation.
-- Lets the dashboard mark news articles and blog posts as featured on the home
-- page and order them. Both tables already allow public read of published
-- rows, so the public home page reads these flags with no extra policy.
-- Idempotent.

alter table public.news  add column if not exists featured_home boolean not null default false;
alter table public.news  add column if not exists featured_rank int;

alter table public.posts add column if not exists featured_home boolean not null default false;
alter table public.posts add column if not exists featured_rank int;

-- Fast lookup of the (small) featured set, ordered by rank.
create index if not exists news_featured_home_idx  on public.news  (featured_rank) where featured_home;
create index if not exists posts_featured_home_idx on public.posts (featured_rank) where featured_home;
