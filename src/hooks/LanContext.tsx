'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'En' | 'Tu' | 'Fa';

interface LangContextType {
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

const getInitialLang = (): Language => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'En' || storedLang === 'Tu' || storedLang === 'Fa')) {
      return storedLang as Language;
    }
  }
  return 'Fa';
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(getInitialLang());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used within LangProvider');
  return context;
}
