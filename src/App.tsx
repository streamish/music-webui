import './index.css';
import { AuthProvider } from './hooks/use-auth.tsx';
import { PreferencesProvider } from './hooks/use-preferences.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueueProvider } from './features/library/queue.tsx';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { router } from './routes';
import { useState } from 'react';

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <div className="w-full min-w-32 min-h-screen overflow-auto select-none">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PreferencesProvider>
            <QueueProvider>
              <TooltipProvider>
                <Toaster />
                <RouterProvider router={router} />
              </TooltipProvider>
            </QueueProvider>
          </PreferencesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}
