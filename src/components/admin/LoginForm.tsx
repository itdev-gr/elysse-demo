import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (err) setError(err.message);
    // On success the onAuthStateChange listener in AdminApp swaps to Dashboard.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-surface border-l-4 border-brand-500 p-8 md:p-10"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Admin</p>
        <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink leading-tight">Sign in.</h1>
        <p className="mt-3 text-sm text-ink/65">Internal access only.</p>

        {error && (
          <p role="alert" className="mt-6 text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
            {error}
          </p>
        )}

        <label className="block mt-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink focus:outline-none focus:border-brand-500"
          />
        </label>

        <label className="block mt-5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink focus:outline-none focus:border-brand-500"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
