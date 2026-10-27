import { ActiveSectionTitle } from './active-section-title';
import { AppSidebar } from '@/features/app-sidebar';
import { Outlet } from 'react-router';
import { QueueControls } from '@/features/library/queue-controls';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRequireAuth } from '@/hooks/use-require-auth';

const HeaderPortalContext = createContext<HTMLElement | null>(null);

export default function UserLayout() {
  const { user, loading } = useRequireAuth();
  const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null);

  if (loading || !user) {
    return null;
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative w-full h-screen overflow-hidden">
          <div className="sticky top-0 z-10 bg-linear-to-b from-background/80 to-background/40 backdrop-blur-md">
            <header className="w-full flex h-14 shrink-0 items-center gap-2 px-4 z-1">
              <SidebarTrigger className="opacity-50" aria-label="Toggle Sidebar" />
              <ActiveSectionTitle />
              <div ref={setHeaderContainer} className="ml-auto flex items-center gap-2" />
            </header>
          </div>
          <main className="flex flex-col min-h-screen bg-background">
            <HeaderPortalContext.Provider value={headerContainer}>
              <Outlet />
            </HeaderPortalContext.Provider>
            <QueueControls />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function PageHeader({ children }: { children: React.ReactNode }) {
  const target = useContext(HeaderPortalContext);
  if (!target) {
    return null;
  }
  return createPortal(children, target);
}
