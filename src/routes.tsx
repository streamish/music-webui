import { AssociationsPage } from './pages/associations';
import { type RouteObject, createBrowserRouter } from 'react-router';
import AccountPage from './pages/account';
import AdminHomePage from './pages/admin/home';
import AdminLayout from './layouts/admin-layout';
import AlbumsPage from './pages/albums';
import FoldersPage from './pages/folders';
import GuestLayout from './layouts/guest-layout';
import RecentlyAddedPage from './pages/recently-added';
import ShoutcastRadioPage from './pages/shoutcast-radio';
import SignInPage from './pages/signin';
import SignOutPage from './pages/signout';
import TracksPage from './pages/tracks';
import UserLayout from './layouts/user-layout';

// Each association section lists items, then drills into an item and optionally one of its albums.
const associationRoutes = (base: string, { withAlbums = true } = {}): RouteObject[] => [
  { path: base, Component: AssociationsPage },
  { path: `${base}/:associationId/:slug`, Component: AssociationsPage },
  ...(withAlbums ? [{ path: `${base}/:associationId/:slug/:albumId/:albumSlug`, Component: AssociationsPage }] : []),
];

export const routes: RouteObject[] = [
  {
    Component: GuestLayout,
    children: [{ path: 'signin', Component: SignInPage }],
  },
  {
    Component: UserLayout,
    children: [
      { index: true, Component: RecentlyAddedPage },
      { path: 'albums', Component: AlbumsPage },
      { path: 'albums/:albumId/:slug', Component: AlbumsPage },
      ...associationRoutes('album-artists'),
      ...associationRoutes('track-artists'),
      ...associationRoutes('track-composers'),
      ...associationRoutes('track-genres', { withAlbums: false }),
      { path: 'folders', Component: FoldersPage },
      { path: 'folders/:folderId/*', Component: FoldersPage },
      { path: 'shoutcast', Component: ShoutcastRadioPage },
      { path: 'shoutcast/:container', Component: ShoutcastRadioPage },
      { path: 'shoutcast/:container/:genreId/:slug', Component: ShoutcastRadioPage },
      { path: 'tracks', Component: TracksPage },
      { path: 'account', Component: AccountPage },
      { path: 'signout', Component: SignOutPage },
    ],
  },
  {
    Component: AdminLayout,
    children: [{ path: 'admin', Component: AdminHomePage }],
  },
];

export const router = createBrowserRouter(routes);
