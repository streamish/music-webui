import { type ComponentType } from 'react';
import { type RouteObject, createBrowserRouter } from 'react-router';
import AdminLayout from './layouts/admin-layout';
import GuestLayout from './layouts/guest-layout';
import UserLayout from './layouts/user-layout';

type PageModule = { default: ComponentType };

// Code-splits a page; the router waits for the chunk before rendering the route.
const page = (load: () => Promise<PageModule>) => async () => ({ Component: (await load()).default });

const associationPage = page(() =>
  import('./pages/associations').then((module) => ({ default: module.AssociationsPage })),
);

// Each association section lists items, then drills into an item and optionally one of its albums.
const associationRoutes = (base: string, { withAlbums = true } = {}): RouteObject[] => [
  { path: base, lazy: associationPage },
  { path: `${base}/:associationId/:slug`, lazy: associationPage },
  ...(withAlbums ? [{ path: `${base}/:associationId/:slug/:albumId/:albumSlug`, lazy: associationPage }] : []),
];

export const routes: RouteObject[] = [
  {
    element: <GuestLayout />,
    children: [{ path: 'signin', lazy: page(() => import('./pages/signin')) }],
  },
  {
    element: <UserLayout />,
    children: [
      { index: true, lazy: page(() => import('./pages/recently-added')) },
      { path: 'albums', lazy: page(() => import('./pages/albums')) },
      { path: 'albums/:albumId/:slug', lazy: page(() => import('./pages/albums')) },
      ...associationRoutes('album-artists'),
      ...associationRoutes('track-artists'),
      ...associationRoutes('track-composers'),
      ...associationRoutes('track-genres', { withAlbums: false }),
      { path: 'folders', lazy: page(() => import('./pages/folders')) },
      { path: 'folders/:folderId/*', lazy: page(() => import('./pages/folders')) },
      { path: 'shoutcast', lazy: page(() => import('./pages/shoutcast-radio')) },
      { path: 'shoutcast/:container', lazy: page(() => import('./pages/shoutcast-radio')) },
      { path: 'shoutcast/:container/:genreId/:slug', lazy: page(() => import('./pages/shoutcast-radio')) },
      { path: 'tracks', lazy: page(() => import('./pages/tracks')) },
      { path: 'account', lazy: page(() => import('./pages/account')) },
      { path: 'signout', lazy: page(() => import('./pages/signout')) },
    ],
  },
  {
    element: <AdminLayout />,
    children: [{ path: 'admin', lazy: page(() => import('./pages/admin/home')) }],
  },
];

export const router = createBrowserRouter(routes);
