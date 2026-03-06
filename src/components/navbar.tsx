'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from './lang-provider';

const links = [
  { href: '/accounts', key: 'accounts' },
  { href: '/contacts', key: 'contacts' },
  { href: '/tags', key: 'tags' },
  { href: '/templates', key: 'templates' },
  { href: '/campaigns', key: 'campaigns' },
  { href: '/rules', key: 'rules' },
  { href: '/helper', key: 'helper' }
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useLang();
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="font-bold">{t.appName}</Link>
        <nav className="flex gap-3 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname.startsWith(link.href) ? 'font-semibold text-blue-600' : ''}>
              {t[link.key]}
            </Link>
          ))}
        </nav>
        <button className="rounded border px-2 py-1 text-xs" onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>
          {lang.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
