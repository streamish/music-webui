import { ArtistCard } from '@/components/artist-card';
import { ArtistExpandedDetails } from '@/components/artist-expanded-details';
import { ArtistListItem } from '@/components/artist-list-item';
import { ArtistStandaloneDetails } from '@/components/artist-standalone-details';
import { AssociationTypeEnum } from '@/types/api-schema';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useAlbumAssociations } from '@/hooks/user/use-associations';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';

export default function AlbumArtistsList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { artistId } = useParams<{ artistId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [columnSize, setColumnSize] = useState(0);
  const [query, setQuery] = useState({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    associationType: AssociationTypeEnum.artist,
  });
  const { artists, total } = useAlbumAssociations(query);
  const listRef = useRef(null);
  const expandedArtistId = artistId ? Number(artistId) : null;
  const expandedArtist =
    expandedArtistId !== null ? (artists.find((artist) => artist.id === expandedArtistId) ?? null) : null;
  const clickedIndex = artists.findIndex((item) => item.id === expandedArtistId) ?? -1;
  let detailsInsertIndex = clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (artists.length) {
    if (detailsInsertIndex > artists.length) {
      detailsInsertIndex = artists.length - 1;
    }
  }

  const getArtistUrl = (id: number) => {
    const artist = artists.find((item) => item.id === id);
    return `/album-artists/${id}/${formatSlug(artist?.name ?? '')}`;
  };

  const toggleArtist = useCallback(
    (id: number) => {
      const newUrl = id === expandedArtistId ? '/album-artists' : getArtistUrl(id);
      navigate(newUrl);
    },
    [artists, expandedArtistId, navigate],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('page', String(nextPage));
        return next;
      });
      setQuery(() => {
        return {
          limit: pageSize,
          offset: (nextPage - 1) * pageSize,
          associationType: AssociationTypeEnum.artist,
        };
      });
    },
    [setSearchParams, pageSize],
  );

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
      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, [artists.length]);

  useEffect(() => {
    if (!expandedArtist || expandedArtistId === null) {
      return;
    }
    let nextPath = expandedArtistId === null ? '/track-artists' : getArtistUrl(expandedArtistId);
    if (pageNumber > 1) {
      nextPath += `?page=${pageNumber}`;
    }
    const currentPath = window.location.pathname;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [expandedArtist, expandedArtistId, navigate]);

  return (
    <div className="relative">
      <title>Album Artists</title>
      {total == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          <PageHeader>
            <PaginationControls page={pageNumber} setPage={setPage} items={total} />
          </PageHeader>
          {isMobile && (
            <ul className="flex flex-col grow">
              {expandedArtistId && (
                <li className="album-details col-span-full flex flex-col grow  -mx-4">
                  {expandedArtist && (
                    <ArtistStandaloneDetails
                      artistId={expandedArtistId}
                      onClose={() => toggleArtist(expandedArtistId)}
                    />
                  )}
                </li>
              )}
              {!expandedArtistId &&
                artists.map((item) => {
                  return (
                    <li className="w-full p-2" key={item.id}>
                      <ArtistListItem
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
              {artists.map((item, index) => {
                const isExpanded = expandedArtistId === item.id;
                const shouldInsertDetails = expandedArtistId && detailsInsertIndex === index;
                return (
                  <Fragment key={item.id}>
                    <li className="w-full h-full inline-flex align-middle justify-center">
                      <ArtistCard artist={item} isExpanded={isExpanded} onToggle={() => toggleArtist(item.id)} />
                    </li>
                    {shouldInsertDetails && (
                      <li className="album-details col-span-full -mx-4">
                        {expandedArtist && <ArtistExpandedDetails artistId={expandedArtistId} artistOnly={true} />}
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
