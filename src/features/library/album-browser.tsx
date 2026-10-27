import { AlbumCard } from '@/features/library/album-card';
import { AlbumExpandedDetails } from '@/features/library/album-expanded-details';
import { AlbumListItem } from '@/features/library/album-list-item';
import { AlbumStandaloneDetails } from '@/features/library/album-standalone-details';
import { Fragment } from 'react';
import { useGridColumnCount } from '@/hooks/use-grid-column-count';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { components } from '@/types/api-schema';

type Album = components['schemas']['LibraryAlbumDto'];

type AlbumBrowserProps = {
  albums: Album[];
  expandedAlbumId: number | null;
  onToggleAlbum: (id: number) => void;
};

export function AlbumBrowser({ albums, expandedAlbumId, onToggleAlbum }: AlbumBrowserProps) {
  const { isMobile } = useIsMobile();
  const { listRef, columnCount } = useGridColumnCount();
  const expandedIndex = albums.findIndex((album) => album.id === expandedAlbumId);
  let detailsInsertIndex =
    columnCount > 0 && expandedIndex >= 0 ? Math.ceil((expandedIndex + 1) / columnCount) * columnCount - 1 : -1;

  if (albums.length && detailsInsertIndex > albums.length) {
    detailsInsertIndex = albums.length - 1;
  }

  if (isMobile) {
    return (
      <ul className="flex flex-col grow overflow-y-scroll h-[calc(100vh-4rem)] md:h-[calc(100vh-9rem)]">
        {expandedAlbumId !== null && (
          <li className="album-details col-span-full flex flex-col grow">
            {albums.some((album) => album.id === expandedAlbumId) && (
              <AlbumStandaloneDetails albumId={expandedAlbumId} onClose={() => onToggleAlbum(expandedAlbumId)} />
            )}
          </li>
        )}
        {expandedAlbumId === null &&
          albums.map((album) => (
            <li className="w-full p-2" key={album.id}>
              <AlbumListItem album={album} isExpanded={false} onToggle={() => onToggleAlbum(album.id)} />
            </li>
          ))}
      </ul>
    );
  }

  return (
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
      {albums.map((album, index) => {
        const isExpanded = expandedAlbumId === album.id;
        const shouldInsertDetails =
          expandedAlbumId !== null &&
          (detailsInsertIndex === index || (index === albums.length - 1 && detailsInsertIndex === albums.length));

        return (
          <Fragment key={album.id}>
            <li className="w-full h-full inline-flex align-middle justify-center">
              <AlbumCard album={album} isExpanded={isExpanded} onToggle={() => onToggleAlbum(album.id)} />
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
  );
}
