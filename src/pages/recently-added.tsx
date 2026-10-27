import { AlbumBrowser } from '@/features/library/album-browser';
import { useRecentlyAddedAlbums } from '@/features/library/api/albums';
import { useState } from 'react';

export default function RecentlyAddedPage() {
  const [expandedAlbumId, setExpandedAlbumId] = useState<number | null>(null);
  const albumsQuery = useRecentlyAddedAlbums();

  const toggleAlbum = (id: number) => {
    setExpandedAlbumId((currentId) => (id === currentId ? null : id));
  };
  return (
    <div className="relative">
      <title>Recently Added</title>
      {albumsQuery.isPending && (
        <p className="text-white-500" role="status">
          Loading…
        </p>
      )}
      {albumsQuery.isError && (
        <p className="text-destructive" role="alert">
          Unable to load recently added albums: {albumsQuery.error.message}
        </p>
      )}
      {albumsQuery.isSuccess && albumsQuery.data.albums.length === 0 && (
        <p className="text-muted-foreground">No recently added albums found.</p>
      )}
      {albumsQuery.isSuccess && albumsQuery.data.albums.length > 0 && (
        <AlbumBrowser albums={albumsQuery.data.albums} expandedAlbumId={expandedAlbumId} onToggleAlbum={toggleAlbum} />
      )}
    </div>
  );
}
