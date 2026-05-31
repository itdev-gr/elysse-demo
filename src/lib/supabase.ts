import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Loud in dev so a missing .env is obvious. Public anon key is safe; RLS guards writes.
  // eslint-disable-next-line no-console
  console.error('Supabase env vars missing. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.');
}

// Guard against SSG prerendering when env vars are absent — `client:visible` components
// only run in the browser where the vars will be present.
export const supabase = (url && anonKey)
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : (null as unknown as ReturnType<typeof createClient>);
