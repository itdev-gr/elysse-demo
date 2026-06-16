-- Per-language overrides for the product name (configuration) and description.
--
-- English stays in products.configuration / products.description and is the
-- fallback shown when a translation is missing. Translations are stored as
-- JSONB keyed by language code: el (Greek) | de | es | fr. Example:
--   name_i18n        = {"el": "Αρσενικός προσαρμογέας", "de": "..."}
--   description_i18n = {"el": "…", "fr": "…"}
--
-- The catalog aggregates these per configuration (first non-empty wins) and the
-- product page swaps to the visitor's chosen language client-side.

alter table public.products
  add column if not exists name_i18n        jsonb not null default '{}'::jsonb,
  add column if not exists description_i18n jsonb not null default '{}'::jsonb;
