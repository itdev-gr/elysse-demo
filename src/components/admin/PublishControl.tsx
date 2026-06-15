import { useEffect, useState } from 'react';
import { getDeployHook, setDeployHook, publishNow } from '../../lib/publish';

type Status = 'idle' | 'publishing' | 'done' | 'error';

export default function PublishControl() {
  const [hook, setHook] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getDeployHook().then((u) => {
      setHook(u);
      setDraft(u ?? '');
      setLoaded(true);
      if (!u) setEditing(true);
    });
  }, []);

  const save = async () => {
    const err = await setDeployHook(draft);
    if (err) { setMsg(err); return; }
    setHook(draft.trim() || null);
    setEditing(false);
    setMsg(null);
  };

  const publish = async () => {
    setStatus('publishing');
    setMsg(null);
    const err = await publishNow();
    if (err) { setStatus('error'); setMsg(err); return; }
    setStatus('done');
    setTimeout(() => setStatus('idle'), 5000);
  };

  if (!loaded) return null;

  return (
    <div className="px-5 py-4 border-t border-ink/10">
      {hook && !editing ? (
        <>
          <button
            type="button"
            onClick={publish}
            disabled={status === 'publishing'}
            className="w-full bg-brand-500 text-surface px-3 py-2 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors duration-200 cursor-pointer"
          >
            {status === 'publishing' ? 'Publishing…' : status === 'done' ? 'Publishing ✓' : 'Publish to live site'}
          </button>
          {status === 'done' && (
            <p className="mt-1.5 text-[10px] text-ink/50">Rebuild started — live in ~1 min.</p>
          )}
          {msg && <p className="mt-1.5 text-[10px] text-red-600">{msg}</p>}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-1.5 text-[10px] text-ink/40 hover:text-ink/70 cursor-pointer"
          >
            Edit deploy hook
          </button>
        </>
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1.5">Vercel deploy hook URL</p>
          <input
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            placeholder="https://api.vercel.com/v1/integrations/deploy/…"
            className="w-full bg-transparent border-b border-ink/25 py-1 text-[11px] text-ink placeholder:text-ink/30 focus:outline-none focus:border-brand-500"
          />
          <div className="mt-2 flex gap-3 items-center">
            <button
              type="button"
              onClick={save}
              className="bg-brand-500 text-surface px-3 py-1 text-[10px] uppercase tracking-[0.2em] cursor-pointer"
            >
              Save
            </button>
            {hook && (
              <button
                type="button"
                onClick={() => { setEditing(false); setDraft(hook); }}
                className="text-[10px] text-ink/50 hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
          {msg && <p className="mt-1.5 text-[10px] text-red-600">{msg}</p>}
        </>
      )}
    </div>
  );
}
