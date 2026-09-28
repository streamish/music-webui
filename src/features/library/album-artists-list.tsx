import { AlbumCard } from '@/components/album-card';
import { AlbumExpandedDetails } from '@/components/album-expanded-details';
import { ArtistListItem } from '@/components/artist-list-item';
import { AssociationTypeEnum } from '@/types/api-schema';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useAlbumAssociations, useAssociation } from '@/hooks/user/use-associations';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';

export default function AlbumArtistsList({ group }: { group: string }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { artistId, albumId } = useParams<{ artistId: string; albumId?: string }>();
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
  const { associations, total } = useAlbumAssociations(query);
  const expandedAssociationId = artistId ? Number(artistId) : associations[0]?.id;
  const { association: expandedAssociation } = useAssociation({
    id: expandedAssociationId,
  });
  const listRef = useRef(null);
  const expandedAlbumId = albumId ? Number(albumId) : null;
  const expandedAlbum =
    expandedAlbumId !== null
      ? (expandedAssociation?.albumArtistCredits.find((album) => album.id === expandedAlbumId) ?? null)
      : null;
  const clickedIndex = expandedAssociation?.albumArtistCredits.findIndex((item) => item.id === expandedAlbumId) ?? -1;
  let detailsInsertIndex = clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (expandedAssociation?.albumArtistCredits.length) {
    if (detailsInsertIndex >= expandedAssociation.albumArtistCredits.length) {
      detailsInsertIndex = expandedAssociation.albumArtistCredits.length - 1;
    }
  }

  const getArtistUrl = (id: number) => {
    const artist = associations.find((item) => item.id === id);
    return `/${group}/${id}/${formatSlug(artist?.name ?? '')}`;
  };

  const getAlbumUrl = (id: number) => {
    const album = expandedAssociation?.albumArtistCredits.find((a) => a.id === id);
    const artistUrl = getArtistUrl(expandedAssociationId);
    return `${artistUrl}/${id}/${formatSlug(album?.title ?? '')}`;
  };

  const toggleArtist = useCallback(
    (id: number) => {
      const newUrl = id === expandedAssociationId ? `/${group}` : getArtistUrl(id);
      navigate(newUrl);
    },
    [associations, expandedAssociation, navigate],
  );

  const toggleAlbum = useCallback(
    (id: number) => {
      const newUrl = id === expandedAlbumId ? getArtistUrl(expandedAssociationId) : getAlbumUrl(id);
      navigate(newUrl);
    },
    [associations, expandedAssociation, expandedAlbum, navigate],
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
  }, [expandedAssociation, expandedAssociation?.albumArtistCredits]);

  useEffect(() => {
    if (!expandedAssociation || expandedAssociationId === null) {
      return;
    }
    let nextPath = expandedAssociationId === null ? '/track-associations' : getArtistUrl(expandedAssociationId);
    if (expandedAlbumId !== null) {
      nextPath = getAlbumUrl(expandedAlbumId);
    }
    if (pageNumber > 1) {
      nextPath += `?page=${pageNumber}`;
    }
    const currentPath = window.location.pathname;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [expandedAssociation, expandedAlbum, navigate]);

  if (!associations.length) {
    return <></>;
  }

  const title = (() => {
    switch (group) {
      case 'albumArtists':
        return 'Album Associations';
      case 'trackArtists':
        return 'Track Associations';
      case 'trackComposers':
        return 'Track Composers';
      case 'trackGenres':
        return 'Track Genres';
      default:
        return '';
    }
  })();

  return (
    <div className="relative py-20">
      <title>{title}</title>
      {total == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          <PageHeader>
            <PaginationControls page={pageNumber} setPage={setPage} items={total} />
          </PageHeader>
          <div className="flex flex-row">
            <ul className="flex flex-col overflow-y-scroll pb-2 h-[calc(100vh-12rem)]">
              {associations.map((item) => {
                return (
                  <li className="w-full px-2" key={item.id}>
                    <ArtistListItem
                      artist={item}
                      isExpanded={expandedAssociationId === item.id}
                      onToggle={() => toggleArtist(item.id)}
                    />
                  </li>
                );
              })}
            </ul>
            {!isMobile && (
              <ul
                ref={listRef}
                className={[
                  'w-full',
                  'grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]',
                  'md:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]',
                  'lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] ',
                  'items-start',
                  'content-start',
                  'auto-rows-max',
                  'justify-start',
                  'gap-4',
                  'overflow-y-scroll h-[calc(100vh-11rem)]',
                ].join(' ')}
                key={expandedAssociationId}
              >
                {expandedAssociation?.albumArtistCredits.map((item, index) => {
                  const isExpanded = expandedAssociationId === item.id;
                  const shouldInsertDetails = expandedAlbumId && detailsInsertIndex === index;
                  return (
                    <Fragment key={item.id}>
                      <li className="w-full inline-flex align-middle justify-center">
                        <AlbumCard album={item} isExpanded={isExpanded} onToggle={() => toggleAlbum(item.id)} />
                      </li>
                      {shouldInsertDetails && (
                        <li className="album-details col-span-full">
                          <AlbumExpandedDetails albumId={expandedAlbumId} albumPreloaded={expandedAlbum} />
                        </li>
                      )}
                    </Fragment>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
