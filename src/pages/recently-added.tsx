import { AlbumCard } from '@/features/library/album-card';
import { AlbumExpandedDetails } from '@/features/library/album-expanded-details';
import { AlbumListItem } from '@/features/library/album-list-item';
import { AlbumStandaloneDetails } from '@/features/library/album-standalone-details';
import { Fragment, useState } from 'react';
import { useGridColumnCount } from '@/hooks/use-grid-column-count';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useRecentlyAddedAlbums } from '@/features/library/api/albums';

export default function RecentlyAddedPage() {
  const { isMobile } = useIsMobile();
  const [expandedAlbumId, setExpandedAlbumId] = useState(0);
  const { listRef, columnCount } = useGridColumnCount();
  const { data: { albums, total } = { albums: [], total: 0 } } = useRecentlyAddedAlbums();
  const expandedAlbum = expandedAlbumId > 0 ? (albums.find((album) => album.id === expandedAlbumId) ?? null) : null;
  const clickedIndex = albums.findIndex((item) => item.id === expandedAlbumId) ?? -1;
  let detailsInsertIndex =
    columnCount > 0 && clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnCount) * columnCount - 1 : -1;
  if (albums.length) {
    if (detailsInsertIndex > albums.length) {
      detailsInsertIndex = albums.length - 1;
    }
  }

  const toggleAlbum = (id: number) => {
    setExpandedAlbumId((currentId) => (id === currentId ? 0 : id));
  };
  return (
    <div className="relative">
      <title>Recently Added</title>
      {total == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          {isMobile && (
            <ul className="flex flex-col grow overflow-y-scroll h-[calc(100vh-4rem)] md:h-[calc(100vh-9rem)]">
              {expandedAlbumId > 0 && (
                <li className="album-details col-span-full flex flex-col grow">
                  {expandedAlbum && (
                    <AlbumStandaloneDetails albumId={expandedAlbumId} onClose={() => toggleAlbum(expandedAlbumId)} />
                  )}
                </li>
              )}
              {expandedAlbumId === 0 &&
                albums.map((item) => {
                  return (
                    <li className="w-full p-2" key={item.id}>
                      <AlbumListItem
                        album={item}
                        isExpanded={expandedAlbumId === item.id}
                        onToggle={() => toggleAlbum(item.id)}
                      />
                    </li>
                  );
                })}
            </ul>
          )}
          {!isMobile && (
            <ul
              ref={listRef}
              className={[
                'grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]',
                'md:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]',
                'lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] ',
                'gap-4',
                'overflow-y-scroll h-[calc(100vh-9rem)]',
              ].join(' ')}
            >
              {albums.map((item, index) => {
                const isExpanded = expandedAlbumId === item.id;
                const shouldInsertDetails =
                  expandedAlbumId > 0 &&
                  (detailsInsertIndex === index ||
                    (index === albums.length - 1 && detailsInsertIndex === albums.length));
                return (
                  <Fragment key={item.id}>
                    <li className="w-full h-full inline-flex align-middle justify-center">
                      <AlbumCard album={item} isExpanded={isExpanded} onToggle={() => toggleAlbum(item.id)} />
                    </li>
                    {shouldInsertDetails && (
                      <li className="album-details col-span-full mt-4">
                        <AlbumExpandedDetails albumId={expandedAlbumId} />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
