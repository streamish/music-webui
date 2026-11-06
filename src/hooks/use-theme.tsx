import { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<boolean | undefined>(undefined);
  const systemPrefersDark = useMediaQuery({ query: '(prefers-color-scheme: dark)' });
  const isDark = preference ?? systemPrefersDark;

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  return <ThemeContext.Provider value={{ isDark, setIsDark: setPreference }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
