export const navigationLinks = [
  'Recently Added',
  'Albums',
  'Album Artists',
  'Artists',
  'Playlists',
  'Composers',
  'Genres',
  'Folders',
  'Shoutcast Radio',
  'Tracks',
] as const;

export type NavigationLink = (typeof navigationLinks)[number];
