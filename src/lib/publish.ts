import { supabase } from './supabase';

/** The configured Vercel Deploy Hook URL (authenticated read only). */
export async function getDeployHook(): Promise<string | null> {
  const { data } = await supabase
    .from('app_settings').select('value').eq('key', 'deploy_hook_url').maybeSingle();
  return (data?.value as string | null) ?? null;
}

export async function setDeployHook(url: string): Promise<string | null> {
  const { error } = await supabase.from('app_settings').upsert({
    key: 'deploy_hook_url',
    value: url.trim() || null,
    updated_at: new Date().toISOString(),
  });
  return error ? error.message : null;
}

/** ISO timestamp of the last publish, or null if never published. */
export async function getLastPublished(): Promise<string | null> {
  const { data } = await supabase
    .from('app_settings').select('value').eq('key', 'last_published_at').maybeSingle();
  return (data?.value as string | null) ?? null;
}

/** Trigger a Vercel rebuild now. Returns an error message, or null on success. */
export async function publishNow(): Promise<string | null> {
  const url = await getDeployHook();
  if (!url) return 'No deploy hook URL configured — add one in the Publish panel.';
  try {
    await fetch(url, { method: 'POST', mode: 'no-cors' });
    await supabase.from('app_settings').upsert({
      key: 'last_published_at',
      value: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Failed to trigger publish.';
  }
}

// Debounce so a burst of edits (e.g. creating several products) coalesces into
// a single rebuild a few seconds after the last change.
let timer: ReturnType<typeof setTimeout> | undefined;

/** Auto-publish after a change (debounced). Safe no-op if no hook is set. */
export function triggerPublish(delayMs = 4000): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void publishNow(); }, delayMs);
}
