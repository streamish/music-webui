import { AssociationTypeEnum } from '@/types/api-schema';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GenreCard } from '@/components/genre-card';
import { GenreExpandedDetails } from '@/components/genre-expanded-details';
import { GenreListItem } from '@/components/genre-list-item';
import { GenreStandaloneDetails } from '@/components/genre-standalone-details';
import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';
import { useTrackAssociations } from '@/hooks/user/use-associations';

export default function TrackGenresList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { genreId } = useParams<{ genreId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [columnSize, setColumnSize] = useState(0);
  const [query, setQuery] = useState({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    associationType: AssociationTypeEnum.genre,
  });
  const { associations: genres, total: totalGenres } = useTrackAssociations(query);
  const listRef = useRef(null);
  const expandedGenreId = genreId ? Number(genreId) : null;
  const expandedGenre =
    expandedGenreId !== null ? (genres.find((genre) => genre.id === expandedGenreId) ?? null) : null;
  const clickedIndex = genres.findIndex((item) => item.id === expandedGenreId) ?? -1;
  let detailsInsertIndex = clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (genres.length) {
    if (detailsInsertIndex > genres.length) {
      detailsInsertIndex = genres.length - 1;
    }
  }

  const getGenreUrl = (id: number) => {
    const genre = genres.find((item) => item.id === id);
    return `/track-genres/${id}/${formatSlug(genre?.name ?? '')}`;
  };

  const toggleGenre = useCallback(
    (id: number) => {
      const newUrl = id === expandedGenreId ? '/track-genres' : getGenreUrl(id);
      navigate(newUrl);
    },
    [genres, expandedGenreId, navigate],
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
        };
      });
    },
    [setSearchParams],
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
  }, [genres.length]);

  useEffect(() => {
    if (!expandedGenre || expandedGenreId === null) {
      return;
    }
    let nextPath = getGenreUrl(expandedGenreId);
    if (pageNumber > 1) {
      nextPath += `?page=${pageNumber}`;
    }
    const currentPath = window.location.pathname;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [expandedGenre, expandedGenreId, navigate]);

  return (
    <>
      <title>Track Genres</title>
      {totalGenres == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          <PageHeader>
            <PaginationControls page={pageNumber} setPage={setPage} items={totalGenres} />
          </PageHeader>
          {isMobile && (
            <ul className="flex flex-col grow">
              {expandedGenreId && (
                <li className="genre-details col-span-full flex flex-col grow  -mx-4">
                  {expandedGenre && (
                    <GenreStandaloneDetails genreId={expandedGenreId} onClose={() => toggleGenre(expandedGenre.id)} />
                  )}
                </li>
              )}
              {!expandedGenreId &&
                genres.map((item) => {
                  return (
                    <li className="w-full p-2" key={`mobile-genre ${item.id}`}>
                      <GenreListItem
                        genre={item}
                        isExpanded={expandedGenreId === item.id}
                        onToggle={() => toggleGenre(item.id)}
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
              {genres.map((item, index) => {
                const isExpanded = expandedGenreId === item.id;
                const shouldInsertDetails = expandedGenreId && detailsInsertIndex === index;
                return (
                  <Fragment key={item.id}>
                    <li className="w-full h-full inline-flex align-middle justify-center">
                      <GenreCard genre={item} isExpanded={isExpanded} onToggle={() => toggleGenre(item.id)} />
                    </li>
                    {shouldInsertDetails && (
                      <li className="genre-details col-span-full -mx-4">
                        {expandedGenre && <GenreExpandedDetails genreId={expandedGenreId} />}
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
