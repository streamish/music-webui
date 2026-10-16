import { createContext, useContext, useEffect, useState } from 'react';
import type { NavigationLink } from '@/types/navigation-link';

export type Preferences = {
  pageSize: number;
  navigation: {
    [key in NavigationLink]: boolean | undefined;
  };
};

interface PreferencesContextType {
  preferences: Preferences;
  setPageSize: (pageSize: number) => void;
  hideItem: (id: NavigationLink) => void;
  showItem: (id: NavigationLink) => void;
  toggleItemVisibility: (id: NavigationLink, value: boolean) => void;
}

const defaultPreferences: Preferences = {
  pageSize: 100,
  navigation: {
    Albums: true,
    'Album Artists': true,
    Artists: true,
    Composers: true,
    Folders: true,
    Genres: true,
    'Recently Added': true,
    'Shoutcast Radio': true,
    Tracks: true,
  },
};

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: defaultPreferences,
  setPageSize: () => {},
  hideItem: () => {},
  showItem: () => {},
  toggleItemVisibility: () => {},
});

function loadPreferences(): Preferences {
  try {
    const saved = localStorage.getItem('preferences');
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences());

  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  function setPageSize(pageSize: number) {
    setPreferences((current) => ({
      ...current,
      pageSize,
    }));
  }

  function hideItem(id: NavigationLink) {
    setPreferences((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [id]: false,
      },
    }));
  }

  function showItem(id: NavigationLink) {
    setPreferences((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [id]: true,
      },
    }));
  }

  function toggleItemVisibility(id: NavigationLink, value: boolean) {
    setPreferences((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        [id]: value,
      },
    }));
  }

  return (
    <PreferencesContext.Provider
      value={{
        hideItem,
        setPageSize,
        showItem,
        toggleItemVisibility,
        preferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): {
  preferences: Preferences;
  setPageSize: (pageSize: number) => void;
  hideItem: (id: NavigationLink) => void;
  showItem: (id: NavigationLink) => void;
  toggleItemVisibility: (id: NavigationLink, value: boolean) => void;
} {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return context;
}
