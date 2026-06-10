-- Contact source for the enquiry form in the closing band of
-- /about-us/quality-certifications/. The Settings tab lists it automatically
-- (recipient editable); contact-notify emails the per-source recipient and
-- messages land in the dashboard Messages tab.
insert into public.contact_settings (source, label, recipient_email) values
  ('quality-certifications', 'Quality — certificate requests', 'info@elysee.com.cy')
on conflict (source) do nothing;
