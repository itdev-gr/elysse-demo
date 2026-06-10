-- New per-form contact sources. The Settings tab lists these automatically
-- (recipient editable per source); the contact-notify edge function emails the
-- per-source recipient. Messages land in the dashboard Messages tab.
insert into public.contact_settings (source, label, recipient_email) values
  ('wise',                 'Elysée WISE',                  'info@elysee.com.cy'),
  ('prime',                'Elysée PRIME',                 'info@elysee.com.cy'),
  ('rohrsysteme',          'Elysée Rohrsysteme',           'info@elysee.com.cy'),
  ('green-certifications', 'Green — certificate requests', 'info@elysee.com.cy'),
  ('green-reports',        'Green — report archive',       'info@elysee.com.cy'),
  ('green-insights',       'Green — press & insights',     'info@elysee.com.cy')
on conflict (source) do nothing;
