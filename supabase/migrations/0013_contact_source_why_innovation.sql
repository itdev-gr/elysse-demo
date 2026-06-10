-- Contact source for the enquiry form in the "Keep going" closing section of
-- /innovation/why-innovation/. The Settings tab lists it automatically
-- (recipient editable); contact-notify emails the per-source recipient and
-- messages land in the dashboard Messages tab.
insert into public.contact_settings (source, label, recipient_email) values
  ('why-innovation', 'Innovation — why innovation', 'info@elysee.com.cy')
on conflict (source) do nothing;
