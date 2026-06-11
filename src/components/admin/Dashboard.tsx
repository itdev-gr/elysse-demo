import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import JobsTab from './JobsTab';
import PostsTab from './PostsTab';
import NewsTab from './NewsTab';
import CountriesTab from './CountriesTab';
import CertificationsTab from './CertificationsTab';
import CataloguesTab from './CataloguesTab';
import MessagesTab from './MessagesTab';
import SettingsTab from './SettingsTab';

type Tab = 'jobs' | 'posts' | 'news' | 'countries' | 'certs' | 'catalogues' | 'messages' | 'settings';

const HEADINGS: Record<Tab, string> = {
  jobs: 'Jobs.',
  posts: 'Posts.',
  news: 'News.',
  countries: 'Countries.',
  certs: 'Certifications.',
  catalogues: 'Catalogues.',
  messages: 'Messages.',
  settings: 'Settings.',
};

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('jobs');

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const tabClass = (which: Tab) =>
    `px-4 py-2 text-[11px] uppercase tracking-[0.25em] font-medium cursor-pointer transition-colors duration-200 ${
      tab === which
        ? 'bg-ink text-surface'
        : 'text-ink/70 hover:text-brand-500'
    }`;

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between border-b border-ink/10 pb-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">
              {HEADINGS[tab]}
            </h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </header>

        <nav className="mb-8 flex items-center gap-2 border-b border-ink/10 pb-4" aria-label="Admin sections">
          <button type="button" onClick={() => setTab('jobs')} className={tabClass('jobs')}>
            Jobs
          </button>
          <button type="button" onClick={() => setTab('posts')} className={tabClass('posts')}>
            Posts
          </button>
          <button type="button" onClick={() => setTab('news')} className={tabClass('news')}>
            News
          </button>
          <button type="button" onClick={() => setTab('countries')} className={tabClass('countries')}>
            Countries
          </button>
          <button type="button" onClick={() => setTab('certs')} className={tabClass('certs')}>
            Certifications
          </button>
          <button type="button" onClick={() => setTab('catalogues')} className={tabClass('catalogues')}>
            Catalogues
          </button>
          <button type="button" onClick={() => setTab('messages')} className={tabClass('messages')}>
            Messages
          </button>
          <button type="button" onClick={() => setTab('settings')} className={tabClass('settings')}>
            Settings
          </button>
        </nav>

        {tab === 'jobs' && <JobsTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'news' && <NewsTab />}
        {tab === 'countries' && <CountriesTab />}
        {tab === 'certs' && <CertificationsTab />}
        {tab === 'catalogues' && <CataloguesTab />}
        {tab === 'messages' && <MessagesTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
