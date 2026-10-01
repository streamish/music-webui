import './index.css';
import { AssociationsPage } from './pages/associations.tsx';
import { AuthProvider } from './hooks/use-auth.tsx';
import { PreferencesProvider } from './hooks/use-preferences.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueueProvider } from './features/library/queue.tsx';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import AccountPage from './pages/account';
import AdminHomePage from './pages/admin/home.tsx';
import AdminLayout from './layouts/admin-layout.tsx';
import AlbumsPage from './pages/albums';
import FoldersPage from './pages/folders';
import GuestLayout from './layouts/guest-layout';
import SignInPage from './pages/signin';
import SignOutPage from './pages/signout';
import TracksPage from './pages/tracks.tsx';
import UserLayout from './layouts/user-layout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<GuestLayout />}>
        <Route path="signin" element={<SignInPage />} />
      </Route>
      <Route element={<UserLayout />}>
        <Route path="/" element={<AlbumsPage />} />
        <Route path="/albums" element={<AlbumsPage />} />
        <Route path="/albums/:albumId/:slug" element={<AlbumsPage />} />
        <Route path="/album-artists" element={<AssociationsPage />} />
        <Route path="/album-artists/:associationId/:slug/:albumId/:albumSlug" element={<AssociationsPage />} />
        <Route path="/album-artists/:associationId/:slug" element={<AssociationsPage />} />
        <Route path="/folders" element={<FoldersPage />} />
        <Route path="/folders/:folderId/:slug*" element={<FoldersPage />} />
        <Route path="/track-artists" element={<AssociationsPage />} />
        <Route path="/track-artists/:associationId/:slug" element={<AssociationsPage />} />
        <Route path="/track-artists/:associationId/:slug/:albumId/:albumSlug" element={<AssociationsPage />} />
        <Route path="/track-composers" element={<AssociationsPage />} />
        <Route path="/track-composers/:associationId/:slug" element={<AssociationsPage />} />
        <Route path="/track-composers/:associationId/:slug" element={<AssociationsPage />} />
        <Route path="/track-composers/:associationId/:slug/:albumId/:albumSlug" element={<AssociationsPage />} />
        <Route path="/track-genres" element={<AssociationsPage />} />
        <Route path="/track-genres/:associationId/:slug" element={<AssociationsPage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="signout" element={<SignOutPage />} />
      </Route>
      <Route element={<AdminLayout />}>
        <Route path="admin" element={<AdminHomePage />} />
      </Route>
    </Route>,
  ),
);

export default function App() {
  const queryClient = new QueryClient();

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
