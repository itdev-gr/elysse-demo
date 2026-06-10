# Contact forms — deploy runbook

The website's contact forms write to Supabase and send a notification email via
Resend. Three things must be live for end-to-end delivery: the **migration**, the
**edge function**, and its **secrets**. Submissions are saved (and appear in the
dashboard) even if email is not yet configured.

## 1. Apply the database migration

```bash
supabase db push
# or paste supabase/migrations/0007_contact.sql into the Supabase SQL editor
```

Creates `contact_submissions` + `contact_settings` (seeded with default
recipients) and their RLS policies.

## 2. Deploy the edge function

```bash
supabase functions deploy contact-notify
```

## 3. Set the secrets

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxx \
  RESEND_FROM='Elysée Website <noreply@your-verified-domain>'
```

- `RESEND_API_KEY` — from https://resend.com → API Keys.
- `RESEND_FROM` — must use a **domain you've verified in Resend** (Resend →
  Domains). Until you verify `elysee.com.cy`, you can test with the default
  `onboarding@resend.dev` sender (works only to your own Resend account email).
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically into
  edge functions — do not set them yourself.

## 4. Configure recipients (no redeploy needed)

Sign in to `/admin` → **Settings** tab → edit the recipient email per source:

| Source | Used by | Default |
|--------|---------|---------|
| `careers` | Careers page form | recruitment@elysee.com.cy |
| `local` | Local Network form | info@elysee.com.cy |
| `worldwide` | Worldwide page form | info@elysee.com.cy |
| `general` | Fallback for any source | info@elysee.com.cy |

If a source has no row, the function falls back to `general`.

## 5. Verify end-to-end

1. Submit the form on `/contact/careers/`.
2. Dashboard → **Messages** shows the new row (status `new`).
3. The `careers` recipient receives the email; the row's `notified_at` fills in.

## How it's protected

- **RLS:** the public anon key may only `INSERT` submissions — it cannot read
  submissions or recipient settings. The function reads them with the
  service-role key (server-side only).
- **Honeypot:** a hidden `website` field; if filled, the client reports success
  but never writes to the database.
- **Length checks:** column `CHECK` constraints bound every field server-side.
- **Resilience:** email is best-effort and fired after the insert; if Resend
  fails, the enquiry is still saved and visible in the dashboard.
