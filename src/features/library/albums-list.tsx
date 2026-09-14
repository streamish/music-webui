import { AlbumCard } from '@/components/album-card';
import { AlbumExpandedDetails } from '@/components/album-expanded-details';
import { AlbumListItem } from '@/components/album-list-item';
import { AlbumStandaloneDetails } from '@/components/album-standalone-details';
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useLibrary } from './library';
import { useNavigate, useParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';

export default function AlbumsList() {
  const navigate = useNavigate();
  const { albums } = useLibrary();
  const isMobile = useIsMobile();
  const [columnSize, setColumnSize] = useState(0);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [page, setPage] = useState(1);
  const listRef = useRef(null);
  const { albumId } = useParams<{ albumId: string }>();
  const expandedAlbumId = albumId ? Number(albumId) : null;
  const expandedAlbum =
    expandedAlbumId !== null ? (albums.find((album) => album.id === expandedAlbumId) ?? null) : null;

  useLayoutEffect(() => {
    const list = listRef.current as HTMLElement | null;
    if (list) {
      const measureColumns = () => {
        const items = Array.from(list.querySelectorAll<HTMLElement>('li')) as HTMLElement[];
        if (items.length > 0) {
          const firstItem = items[0];
          let interruptedByExpandedAlbum = -1;
          for (let i = 1; i < items.length; i += 1) {
            const item = items[i];
            if (item.classList.contains('album-details')) {
              interruptedByExpandedAlbum = i;
              break;
            }
            if (item.offsetTop > firstItem.offsetTop) {
              setColumnSize(i);
              break;
            }
          }
          // find the first row-starting element after the expanded album details
          if (interruptedByExpandedAlbum > -1) {
            let newFirstItem = -1;
            for (let i = interruptedByExpandedAlbum + 1; i < items.length; i += 1) {
              const item = items[i];
              if (item.offsetLeft === firstItem.offsetLeft) {
                newFirstItem = i;
                break;
              }
            }
            // measure the column size starting from the new first item
            if (newFirstItem > -1) {
              const newFirst = items[newFirstItem];
              for (let i = newFirstItem + 1; i < items.length; i += 1) {
                const item = items[i];
                if (item.offsetTop > newFirst.offsetTop) {
                  const newColumnSize = i - newFirstItem;
                  if (newColumnSize > 0) {
                    setColumnSize(newColumnSize);
                  }
                  break;
                }
              }
            }
          }
        }
      };
      measureColumns();
      const observer = new ResizeObserver(measureColumns);
      observer.observe(list);
      window.addEventListener('resize', measureColumns);
      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, [albums.length]);

  function toggleAlbum(id: number) {
    if (expandedAlbumId === id) {
      navigate('/albums');
    } else {
      const album = albums.find((item) => item.id === id);
      if (!album) {
        // eslint-disable-next-line no-console
        console.error(`Album with id ${id} not found`);
        return;
      }
      const artists = album.artists.map((artist) => artist.name).join(', ');
      navigate(`/albums/${id}/${formatSlug(album.title)}-${formatSlug(artists)}`);
    }
  }

  const visibleData = useMemo(() => {
    if (pageSize) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return albums.slice(start, end) || [];
    }
    return albums;
  }, [albums, page, pageSize]);

  const clickedAlbumIndex = visibleData.findIndex((item) => item.id === expandedAlbumId) ?? -1;
  const insertingAlbum = visibleData[clickedAlbumIndex];
  let detailsInsertIndex =
    clickedAlbumIndex >= 0 ? Math.ceil((clickedAlbumIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (visibleData.length) {
    if (detailsInsertIndex > visibleData.length) {
      detailsInsertIndex = visibleData.length - 1;
    }
  }

  return (
    <>
      <title>Albums</title>
      {isMobile && (
        <ul className="flex flex-col grow">
          {insertingAlbum && (
            <li
              className="album-details col-span-full flex flex-col grow  -mx-4"
              key={`mobile-expanding-album-details ${insertingAlbum.id}`}
            >
              {expandedAlbum && (
                <AlbumStandaloneDetails
                  album={expandedAlbum}
                  showArtistHeader={true}

                  onClose={() => toggleAlbum(expandedAlbum.id)}
                />
              )}
            </li>
          )}
          {!insertingAlbum &&
            visibleData.map((item, index) => {
              return (
                <li className="w-full p-2" key={`mobile-album ${item.id}-${index}`}>
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
        <>
          <ul
            ref={listRef}
            className={[
              'grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]',
              'md:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]',
              'lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] ',
              'gap-4 mx-4',
            ].join(' ')}
          >
            {visibleData.map((item, index) => {
              const isExpanded = expandedAlbumId === item.id;
              const shouldInsertDetails = detailsInsertIndex === index;
              return (
                <Fragment key={`album ${item.id}-${index}`}>
                  <li className="w-full h-full inline-flex align-middle justify-center">
                    <AlbumCard album={item} isExpanded={isExpanded} onToggle={() => toggleAlbum(item.id)} />
                  </li>
                  {shouldInsertDetails && (
                    <li key={`album-details-${item.id}-${index}`} className="album-details col-span-full -mx-4 mt-4">
                      {expandedAlbum && (
                        <AlbumExpandedDetails
                          key={`album-detailsz${item.id}-${index}`}
                          album={expandedAlbum}
                          showArtistHeader={true}
                        />
                      )}
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
          <PaginationControls page={page} setPage={setPage} items={albums?.length ?? 0} />
        </>
      )}
    </>
  );
}
