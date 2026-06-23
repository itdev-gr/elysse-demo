-- 0021_category_i18n.sql
-- Multilingual category + subcategory names (and category blurb), mirroring the
-- product i18n pattern (0020): the English text stays in the base column, while
-- non-English translations live in a JSONB keyed by language code
-- (el / de / es / fr). Anything missing falls back to English on the site.
--
-- name_i18n  = {"el": "...", "de": "...", "es": "...", "fr": "..."}  (sparse)
-- blurb_i18n = {"el": "...", "fr": "..."}                            (sparse)

ALTER TABLE public.product_categories
  ADD COLUMN IF NOT EXISTS name_i18n  JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS blurb_i18n JSONB NOT NULL DEFAULT '{}'::JSONB;

ALTER TABLE public.product_subcategories
  ADD COLUMN IF NOT EXISTS name_i18n JSONB NOT NULL DEFAULT '{}'::JSONB;
