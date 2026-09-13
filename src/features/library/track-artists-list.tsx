import { AlbumArtistListItem } from '@/components/artist-list-item';
import { AlbumArtistStandaloneDetails } from '@/components/artist-standalone-details';
import { ArtistCard } from '@/components/artist-card';
import { ArtistExpandedDetails } from '@/components/artist-expanded-details';
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useLibrary } from './library';
import { useNavigate, useParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';

export default function ArtistsList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { artists } = useLibrary();
  const [columnSize, setColumnSize] = useState(0);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [page, setPage] = useState(1);
  const listRef = useRef(null);
  const { artistId } = useParams<{ artistId: string }>();
  const expandedArtistId = artistId ? Number(artistId) : null;
  const expandedArtist =
    expandedArtistId !== null ? (artists.find((artist) => artist.id === expandedArtistId) ?? null) : null;

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
        window.removeEventListener('resize', measureColumns);
      };
    }
    return undefined;
  }, [artists.length]);

  function toggleArtist(id: number) {
    if (expandedArtistId === id) {
      navigate('/track-artists');
    } else {
      const artist = artists.find((item) => item.id === id);
      if (!artist) {
        // eslint-disable-next-line no-console
        console.error(`Artist with id ${id} not found`);
        return;
      }
      navigate(`/track-artists/${id}/${formatSlug(artist.name)}`);
    }
  }

  const visibleData = useMemo(() => {
    if (pageSize) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return artists.slice(start, end) || [];
    }
    return artists;
  }, [artists, page, pageSize]);

  const clickedArtistIndex = visibleData.findIndex((item) => item.id === expandedArtistId) ?? -1;
  const insertingArtist = visibleData[clickedArtistIndex];
  let detailsInsertIndex =
    clickedArtistIndex >= 0 ? Math.ceil((clickedArtistIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (visibleData.length) {
    if (detailsInsertIndex > visibleData.length) {
      detailsInsertIndex = visibleData.length - 1;
    }
  }

  return (
    <>
      <title>Track Artists</title>
      {isMobile && (
        <ul className="flex flex-col grow">
          {insertingArtist && (
            <li className="album-details col-span-full flex flex-col grow  -mx-4">
              {expandedArtist && (
                <AlbumArtistStandaloneDetails
                  artist={expandedArtist}
                  artistOnly={true}
                  onClose={() => toggleArtist(expandedArtist.id)}
                />
              )}
            </li>
          )}
          {!insertingArtist &&
            visibleData.map((item) => {
              return (
                <li className="w-full p-2" key={`mobile-album ${item.id}`}>
                  <AlbumArtistListItem
                    artist={item}
                    isExpanded={expandedArtistId === item.id}
                    onToggle={() => toggleArtist(item.id)}
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
            'gap-4 mx-4',
          ].join(' ')}
        >
          {visibleData.map((item, index) => {
            const isExpanded = expandedArtistId === item.id;
            const shouldInsertDetails = detailsInsertIndex === index;
            return (
              <Fragment key={`track-artist ${item.id}`}>
                <li className="w-full h-full inline-flex align-middle justify-center">
                  <ArtistCard artist={item} isExpanded={isExpanded} onToggle={() => toggleArtist(item.id)} />
                </li>
                {shouldInsertDetails && (
                  <li className="album-details col-span-full -mx-4">
                    {expandedArtist && <ArtistExpandedDetails artist={expandedArtist} artistOnly={true} />}
                  </li>
                )}
              </Fragment>
            );
          })}
        </ul>
      )}
      <PaginationControls page={page} setPage={setPage} items={artists?.length ?? 0} />
    </>
  );
}
