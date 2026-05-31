import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

const configured = Boolean(url && anonKey);

if (!configured) {
  // Loud in dev so a missing .env is obvious. Public anon key is safe; RLS guards writes.
  // eslint-disable-next-line no-console
  console.error('Supabase env vars missing. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.');
}

// Always construct a real client so consumers can call `supabase.from(...)` safely.
// When env vars are absent we point at a placeholder URL — network calls fail
// fast and the consumer's existing error states (e.g. JobsList "temporarily
// unavailable") render correctly. RLS still guards the real backend.
export const supabase = configured
  ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true } })
  : createClient('https://supabase-not-configured.invalid', 'placeholder', {
      auth: { persistSession: false, autoRefreshToken: false },
    });

export const isSupabaseConfigured = configured;
