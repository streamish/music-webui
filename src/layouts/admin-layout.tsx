import { ActiveSectionTitle } from './active-section-title';
import { AppSidebar } from '@/features/app-sidebar';
import { IndexerProvider } from '@/features/admin/indexer-status';
import { Outlet } from 'react-router';
import { QueueControls } from '@/features/library/queue-controls';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function AdminLayout() {
  const { user, loading } = useRequireAuth('admin');

  if (loading || !user) {
    return null;
  }
  return (
    <IndexerProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="opacity-25" />
            <ActiveSectionTitle />
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
