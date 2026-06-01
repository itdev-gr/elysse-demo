'use client';
/**
 * World map + contact form for /contact/worldwide/.
 *
 * Fetches all active countries from Supabase on mount and passes the
 * resulting marker list to ElyseeWorldMap. When the user clicks a marker
 * the matching row is used to populate the details card and the form.
 */
import { useEffect, useMemo, useState } from 'react';
import ElyseeWorldMap from './ElyseeWorldMap';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Country } from '../../types/country';

const FALLBACK_EMAIL = 'yerolemos@elysee.com.cy';

type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; countries: Country[] };

export default function WorldwideExplorer() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [code, setCode] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true);
      if (cancelled) return;
      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      setState({ kind: 'ready', countries: (data ?? []) as Country[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markers = useMemo(() => {
    if (state.kind !== 'ready') return [];
    return state.countries.map((c) => ({
      code: c.code,
      lat: c.lat,
      lng: c.lng,
      kind: c.kind,
      nudge: c.nudge_x != null && c.nudge_y != null
        ? { x: c.nudge_x, y: c.nudge_y }
        : undefined,
    }));
  }, [state]);

  const contact: Country | null = useMemo(() => {
    if (state.kind !== 'ready' || code === null) return null;
    return state.countries.find((c) => c.code === code) ?? null;
  }, [state, code]);

  const handleSelect = (next: string) => {
    setCode(next);
    if (state.kind === 'ready') {
      const c = state.countries.find((row) => row.code === next);
      if (c) setMessage(c.prefilled_message);
    }
  };

  const formTarget = contact?.email ?? FALLBACK_EMAIL;
  const countryFieldValue = contact?.country ?? '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

      {/* Map + country details (left) */}
      <div className="lg:col-span-7">
        {state.kind === 'loading' && (
          <div className="aspect-[16/9] bg-surface-alt border-l-4 border-brand-500/40 animate-pulse"></div>
        )}

        {state.kind === 'error' && (
          <div className="aspect-[16/9] bg-surface-alt border-l-4 border-brand-500/40 flex items-center justify-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-ink/60">Map temporarily unavailable</p>
          </div>
        )}

        {state.kind === 'ready' && (
          <ElyseeWorldMap markers={markers} onCountrySelect={handleSelect} selectedCode={code} />
        )}

        {/* Country details — appears under the map when a country is picked */}
        <div className="mt-8 md:mt-10">
          {!contact && (
            <div className="bg-surface-alt border-l-4 border-brand-500/40 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Tap any country</p>
              <p className="text-base text-ink/75 leading-relaxed">
                Pick a marker on the map to see local contact details — we will route your
                message to the closest Elysée office or partner.
              </p>
            </div>
          )}

          {contact && (
            <div className="bg-surface border-l-4 border-brand-500 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
                {contact.kind === 'subsidiary' ? 'Subsidiary' : 'Partner country'}
              </p>
              <h3 className="mt-2 font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{contact.label}</h3>
              {contact.note && <p className="mt-2 text-sm text-ink/65">{contact.note}</p>}
              <div aria-hidden="true" className="mt-5 h-px w-10 bg-brand-500"></div>

              <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div className="sm:col-span-2">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Address</dt>
                  <dd className="mt-1 text-ink whitespace-pre-line leading-relaxed">{contact.address}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Phone</dt>
                  <dd className="mt-1 text-ink">
                    <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand-500 transition-colors duration-200">{contact.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</dt>
                  <dd className="mt-1 text-ink break-all">
                    <a href={`mailto:${contact.email}`} className="hover:text-brand-500 transition-colors duration-200">{contact.email}</a>
                  </dd>
                </div>
                {contact.website && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Website</dt>
                    <dd className="mt-1 text-ink">
                      <a href={`https://${contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors duration-200">{contact.website}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Contact form (right) */}
      <aside className="lg:col-span-5 lg:sticky lg:top-32">
        <form
          action={`mailto:${formTarget}`}
          method="post"
          encType="text/plain"
          className="bg-surface-alt p-6 md:p-8"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-5">Send a message</p>

          <label className="block mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Country</span>
            <input
              type="text"
              name="country"
              value={countryFieldValue}
              readOnly
              placeholder="Select a country on the map"
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40"
            />
          </label>

          <label className="block mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Your name</span>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
              placeholder="Jane Doe"
            />
          </label>

          <label className="block mb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Email</span>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
              placeholder="jane@company.com"
            />
          </label>

          <label className="block mb-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Message</span>
            <textarea
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder={contact ? '' : 'Pick a country on the map to pre-fill, or write your enquiry here.'}
              className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500 resize-none"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
          >
            Send message
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          {!contact && (
            <p className="mt-5 text-[11px] text-ink/55 leading-relaxed">
              No country picked — your message will be routed to the Export Department in Cyprus.
            </p>
          )}
        </form>
      </aside>
    </div>
  );
}
