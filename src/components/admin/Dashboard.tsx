import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import JobsTab from './JobsTab';
import PostsTab from './PostsTab';
import NewsTab from './NewsTab';
import ExhibitionsTab from './ExhibitionsTab';
import MediaTab from './MediaTab';
import EbooksTab from './EbooksTab';
import CountriesTab from './CountriesTab';
import CertificationsTab from './CertificationsTab';
import CataloguesTab from './CataloguesTab';
import MessagesTab from './MessagesTab';
import SettingsTab from './SettingsTab';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import FamiliesTab from './FamiliesTab';
import GroupsTab from './GroupsTab';
import DataErrorsTab from './DataErrorsTab';
import ImagesTab from './ImagesTab';

type Tab =
  | 'jobs' | 'posts' | 'news' | 'exhibitions' | 'media' | 'ebooks' | 'countries' | 'certs' | 'catalogues'
  | 'products' | 'categories' | 'families' | 'groups' | 'errors' | 'messages' | 'settings' | 'images';

const HEADINGS: Record<Tab, string> = {
  jobs: 'Jobs.',
  posts: 'Blogs.',
  news: 'News.',
  exhibitions: 'Exhibitions.',
  media: 'Media.',
  ebooks: 'eBooks.',
  countries: 'Countries.',
  certs: 'Certifications.',
  catalogues: 'Catalogues.',
  images: 'Images.',
  products: 'Products.',
  categories: 'Categories.',
  families: 'Families.',
  groups: 'Country Groups.',
  errors: 'Data Errors.',
  messages: 'Messages.',
  settings: 'Settings.',
};

/** Sidebar sections — grouped by area of the site they manage. */
const GROUPS: { label: string; items: { id: Tab; label: string }[] }[] = [
  {
    label: 'Products',
    items: [
      { id: 'products', label: 'Products' },
      { id: 'categories', label: 'Categories' },
      { id: 'families', label: 'Families' },
      { id: 'groups', label: 'Country Groups' },
      { id: 'errors', label: 'Data Errors' },
      { id: 'catalogues', label: 'Catalogues' },
      { id: 'images', label: 'Images' },
    ],
  },
  {
    label: 'Certificates',
    items: [{ id: 'certs', label: 'Certifications' }],
  },
  {
    label: 'Insights',
    items: [
      { id: 'posts', label: 'Blogs' },
      { id: 'news', label: 'News' },
      { id: 'exhibitions', label: 'Exhibitions' },
      { id: 'media', label: 'Media' },
      { id: 'ebooks', label: 'eBooks' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { id: 'messages', label: 'Messages' },
      { id: 'countries', label: 'Countries' },
      { id: 'jobs', label: 'Jobs' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('products');
  const [navOpen, setNavOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const itemClass = (id: Tab) =>
    `block w-full text-left px-3 py-2 text-sm rounded-sm border-l-2 transition-colors duration-200 cursor-pointer ${
      tab === id
        ? 'bg-brand-500/10 text-brand-500 font-semibold border-brand-500'
        : 'text-ink/70 hover:text-brand-500 hover:bg-ink/5 border-transparent'
    }`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6 border-b border-ink/10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">Elysée</p>
        <p className="font-display font-heavy text-lg text-ink leading-tight">Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Admin sections">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.25em] text-ink/45">{group.label}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setTab(it.id);
                    setNavOpen(false);
                  }}
                  aria-current={tab === it.id ? 'page' : undefined}
                  className={itemClass(it.id)}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-ink/10">
        <button
          type="button"
          onClick={signOut}
          className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-alt flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-surface border-r border-ink/10 h-screen sticky top-0">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNavOpen(false)} aria-hidden="true" />
          <aside className="relative w-64 max-w-[80%] bg-surface border-r border-ink/10 h-full">{sidebar}</aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="inline-flex items-center justify-center w-9 h-9 -ml-1 text-ink hover:text-brand-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-display font-heavy text-ink">{HEADINGS[tab]}</span>
          <span className="w-9" aria-hidden="true" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 md:py-10">
          <header className="hidden md:block border-b border-ink/10 pb-6 mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">{HEADINGS[tab]}</h1>
          </header>

          {tab === 'jobs' && <JobsTab />}
          {tab === 'posts' && <PostsTab />}
          {tab === 'news' && <NewsTab />}
          {tab === 'exhibitions' && <ExhibitionsTab />}
          {tab === 'media' && <MediaTab />}
          {tab === 'ebooks' && <EbooksTab />}
          {tab === 'countries' && <CountriesTab />}
          {tab === 'certs' && <CertificationsTab />}
          {tab === 'catalogues' && <CataloguesTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'families' && <FamiliesTab />}
          {tab === 'groups' && <GroupsTab />}
          {tab === 'errors' && <DataErrorsTab />}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'settings' && <SettingsTab />}
          {tab === 'images' && <ImagesTab />}
        </div>
      </div>
    </div>
  );
}
