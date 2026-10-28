import { type NavigationLink, navigationLinks } from '@/types/navigation-link';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Preferences = {
  pageSize: number;
  navigation: {
    [key in NavigationLink]: boolean | undefined;
  };
};

interface PreferencesContextValue {
  preferences: Preferences;
  setPageSize: (pageSize: number) => void;
  hideItem: (id: NavigationLink) => void;
  showItem: (id: NavigationLink) => void;
  toggleItemVisibility: (id: NavigationLink, value: boolean) => void;
}

const defaultPreferences: Preferences = {
  pageSize: 100,
  navigation: Object.fromEntries(navigationLinks.map((link) => [link, true])) as Preferences['navigation'],
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadPreferences(): Preferences {
  try {
    const saved = localStorage.getItem('preferences');
    if (!saved) {
      return defaultPreferences;
    }

    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed)) {
      return defaultPreferences;
    }

    const savedNavigation = isRecord(parsed.navigation) ? parsed.navigation : {};
    const navigation = navigationLinks.reduce<Preferences['navigation']>(
      (result, link) => ({
        ...result,
        [link]:
          typeof savedNavigation[link] === 'boolean' ? savedNavigation[link] : defaultPreferences.navigation[link],
      }),
      { ...defaultPreferences.navigation },
    );

    return {
      pageSize:
        typeof parsed.pageSize === 'number' && Number.isSafeInteger(parsed.pageSize) && parsed.pageSize >= 0
          ? parsed.pageSize
          : defaultPreferences.pageSize,
      navigation,
    };
  } catch {
    return defaultPreferences;
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences());

  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  const setPageSize = useCallback((pageSize: number) => {
    setPreferences((current) => ({
      ...current,
      pageSize,
    }));
  }, []);

  const hideItem = useCallback((id: NavigationLink) => {
    setPreferences((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [id]: false,
      },
    }));
  }, []);

  const showItem = useCallback((id: NavigationLink) => {
    setPreferences((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [id]: true,
      },
    }));
  }, []);

  const toggleItemVisibility = useCallback((id: NavigationLink, value: boolean) => {
    setPreferences((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [id]: value,
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      hideItem,
      setPageSize,
      showItem,
      toggleItemVisibility,
      preferences,
    }),
    [hideItem, setPageSize, showItem, toggleItemVisibility, preferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return context;
}
