import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function GroupCountryForm({ groupCode, onDone, onCancel }:
  { groupCode: string; onDone: () => void; onCancel: () => void }) {
  const [country, setCountry] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!country.trim()) return setError('Country name is required.');
    setBusy(true);
    const { error: err } = await supabase.from('group_countries')
      .insert({ group_code: groupCode, country: country.trim(), country_code: code.trim() || null });
    if (err) { setBusy(false); return setError(err.code === '23505' ? 'That country is already mapped to a group.' : err.message); }
    setBusy(false);
    onDone();
  };

  return (
    <div className="mb-4 flex items-end gap-3 flex-wrap">
      {error && <p role="alert" className="w-full text-xs text-red-700">{error}</p>}
      <label className="text-xs">Country
        <input
          value={country}
          onChange={(e) => setCountry(e.currentTarget.value)}
          className="block border-b border-ink/25 py-1 text-sm"
        />
      </label>
      <label className="text-xs">ISO code
        <input
          value={code}
          onChange={(e) => setCode(e.currentTarget.value)}
          placeholder="au"
          className="block border-b border-ink/25 py-1 text-sm w-16 font-mono"
        />
      </label>
      <button type="button" onClick={submit} disabled={busy} className="bg-brand-500 text-surface px-3 py-1.5 text-[11px] uppercase disabled:opacity-60">Add</button>
      <button type="button" onClick={onCancel} className="text-[11px] text-ink/60">Cancel</button>
    </div>
  );
}
