'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { dictionary, type Lang } from '@/lib/i18n';

type Context = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof dictionary.en;
};

const LangContext = createContext<Context | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');

  useEffect(() => {
    const stored = localStorage.getItem('pixelmouse-lang') as Lang | null;
    if (stored && (stored === 'es' || stored === 'en')) {
      setLang(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang: (newLang: Lang) => {
        localStorage.setItem('pixelmouse-lang', newLang);
        setLang(newLang);
      },
      t: dictionary[lang]
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
