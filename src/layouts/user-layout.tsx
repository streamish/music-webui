import { AppSidebar, primaryLinks, secondaryLinks } from '@/features/app-sidebar';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { QueueControls } from '@/features/library/queue-controls';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/use-auth';

const HeaderPortalContext = createContext<HTMLElement | null>(null);
const allNavigationLinks = [...primaryLinks, ...secondaryLinks];

function getActiveNavigationItem(pathname: string) {
  return allNavigationLinks
    .filter(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const activeItem = getActiveNavigationItem(location.pathname);
  const ActiveIcon = activeItem?.icon;
  const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      if (location.pathname.startsWith('/signout')) {
        navigate('/signin');
      } else {
        navigate(`/signin?returnUrl=${encodeURIComponent(location.pathname)}`);
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return null;
  }

  if (!user) {
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
              {activeItem && ActiveIcon && (
                <>
                  <div className="h-5 w-px bg-border" />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ActiveIcon className="size-4 text-muted-foreground" />
                    <span>{activeItem.label}</span>
                  </div>
                </>
              )}
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
