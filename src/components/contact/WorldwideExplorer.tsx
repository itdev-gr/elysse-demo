'use client';
/**
 * Side-by-side world map + contact form for /contact/worldwide/.
 *
 * State flow: ElyseeWorldMap -> onCountrySelect(code) -> WorldwideExplorer
 * state.selectedCode -> details card (address/phone/email) + form fields
 * (country, prefilled message). Default state: no country picked, the
 * right column shows a small instruction card.
 */
import { useState } from 'react';
import ElyseeWorldMap from './ElyseeWorldMap';
import { worldwideContacts, type CountryContact } from '@/data/worldwide-contacts';

export default function WorldwideExplorer() {
  const [code, setCode] = useState<string | null>(null);
  const contact: CountryContact | null = code ? worldwideContacts[code] ?? null : null;

  // Controlled form state — name & email are user input; message starts as
  // the country's prefilledMessage and resets every time a new country is picked.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSelect = (next: string) => {
    setCode(next);
    const c = worldwideContacts[next];
    if (c) setMessage(c.prefilledMessage);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

      {/* Map (left) */}
      <div className="lg:col-span-7">
        <ElyseeWorldMap onCountrySelect={handleSelect} selectedCode={code} />
      </div>

      {/* Details + form (right) */}
      <aside className="lg:col-span-5 lg:sticky lg:top-32">
        {!contact && (
          <div className="bg-surface-alt border-l-4 border-brand-500/40 p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Tap any country</p>
            <p className="text-base text-ink/75 leading-relaxed">
              Pick a marker on the map to see local contact details and start a message —
              we will route it to the closest Elysée office or partner.
            </p>
          </div>
        )}

        {contact && (
          <div>
            {/* Country details */}
            <div className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">
                {contact.kind === 'subsidiary' ? 'Subsidiary' : 'Partner country'}
              </p>
              <h3 className="mt-2 font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{contact.label}</h3>
              {contact.note && <p className="mt-2 text-sm text-ink/65">{contact.note}</p>}
              <div aria-hidden="true" className="mt-5 h-px w-10 bg-brand-500"></div>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
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
                  <dd className="mt-1 text-ink">
                    <a href={`mailto:${contact.email}`} className="hover:text-brand-500 transition-colors duration-200">{contact.email}</a>
                  </dd>
                </div>
                {contact.website && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Website</dt>
                    <dd className="mt-1 text-ink">
                      <a href={`https://${contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors duration-200">{contact.website}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Pre-filled contact form */}
            <form
              action={`mailto:${contact.email}`}
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
                  value={contact.country}
                  readOnly
                  className="mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink"
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
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}
