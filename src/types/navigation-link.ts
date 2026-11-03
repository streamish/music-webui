export const navigationLinks = [
  'Recently Added',
  'Playlists',
  'Albums',
  'Album Artists',
  'Artists',
  'Composers',
  'Genres',
  'Folders',
  'Shoutcast Radio',
  'Tracks',
] as const;

export type NavigationLink = (typeof navigationLinks)[number];
