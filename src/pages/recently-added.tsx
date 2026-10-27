import { AlbumBrowser } from '@/features/library/album-browser';
import { useRecentlyAddedAlbums } from '@/features/library/api/albums';
import { useState } from 'react';

export default function RecentlyAddedPage() {
  const [expandedAlbumId, setExpandedAlbumId] = useState<number | null>(null);
  const { data: { albums, total } = { albums: [], total: 0 } } = useRecentlyAddedAlbums();

  const toggleAlbum = (id: number) => {
    setExpandedAlbumId((currentId) => (id === currentId ? null : id));
  };
  return (
    <div className="relative">
      <title>Recently Added</title>
      {total == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <AlbumBrowser albums={albums} expandedAlbumId={expandedAlbumId} onToggleAlbum={toggleAlbum} />
      )}
    </div>
  );
}
