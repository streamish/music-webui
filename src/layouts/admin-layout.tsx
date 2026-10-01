import { AppSidebar, primaryLinks, secondaryLinks } from '@/components/app-sidebar';
import { IndexerProvider } from '@/hooks/admin/use-indexer';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { QueueControls } from '@/components/queue-controls';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

const allNavigationLinks = [...primaryLinks, ...secondaryLinks];

function getActiveNavigationItem(pathname: string) {
  return allNavigationLinks
    .filter(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const activeItem = getActiveNavigationItem(location.pathname);
  const ActiveIcon = activeItem?.icon;

  useEffect(() => {
    if (!loading && !user) {
      if (!location.pathname.startsWith('/signout')) {
        navigate(`/signin?returnUrl=${encodeURIComponent(location.pathname)}`);
      } else {
        navigate(`/signin`);
      }
      return;
    }
    if (!loading && user?.roles.indexOf('admin') === -1) {
      toast.error('You must be signed in as an admin to access this page.');
      navigate(`/`);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }
  if (!user) {
    return null;
  }
  return (
    <IndexerProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="opacity-25" />
            {activeItem && ActiveIcon && (
              <>
                <div className="h-5 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ActiveIcon className="size-4 text-muted-foreground" />
                  <span>{activeItem.label}</span>
                </div>
              </>
            )}
          </header>
          <main className="flex min-h-0 flex-1 flex-col">
            <Outlet />
            <QueueControls />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </IndexerProvider>
  );
}
