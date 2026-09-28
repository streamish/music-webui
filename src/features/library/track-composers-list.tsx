import { AssociationTypeEnum } from '@/types/api-schema';
import { ComposerCard } from '@/components/composer-card';
import { ComposerExpandedDetails } from '@/components/composer-expanded-details';
import { ComposerListItem } from '@/components/composer-list-item';
import { ComposerStandaloneDetails } from '@/components/composer-standalone-details';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';
import { useTrackAssociations } from '@/hooks/user/use-associations';

export default function TrackComposersList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { composerId } = useParams<{ composerId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [columnSize, setColumnSize] = useState(0);
  const [query, setQuery] = useState({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    associationType: AssociationTypeEnum.composer,
  });
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const { associations: composers, total: totalComposers } = useTrackAssociations(query);
  const listRef = useRef(null);
  const expandedComposerId = composerId ? Number(composerId) : null;
  const expandedComposer =
    expandedComposerId !== null ? (composers.find((composer) => composer.id === expandedComposerId) ?? null) : null;
  const clickedIndex = composers.findIndex((item) => item.id === expandedComposerId) ?? -1;
  let detailsInsertIndex = clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (composers.length) {
    if (detailsInsertIndex > composers.length) {
      detailsInsertIndex = composers.length - 1;
    }
  }

  const getComposerUrl = (id: number) => {
    const composer = composers.find((item) => item.id === id);
    return `/track-composers/${id}/${formatSlug(composer?.name ?? '')}`;
  };

  const toggleComposer = useCallback(
    (id: number) => {
      const newUrl = id === expandedComposerId ? '/track-composers' : getComposerUrl(id);
      navigate(newUrl);
    },
    [composers, expandedComposerId, navigate],
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
  }, [composers.length]);

  useEffect(() => {
    if (!expandedComposer || expandedComposerId === null) {
      return;
    }
    let nextPath = getComposerUrl(expandedComposerId);
    if (pageNumber > 1) {
      nextPath += `?page=${pageNumber}`;
    }
    const currentPath = window.location.pathname;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [expandedComposer, expandedComposerId, navigate]);

  return (
    <div className="relative">
      <title>Composers</title>
      {totalComposers == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          <PageHeader>
            <PaginationControls page={pageNumber} setPage={setPage} items={totalComposers} />
          </PageHeader>
          {isMobile && (
            <ul className="flex flex-col grow">
              {expandedComposerId && (
                <li className="album-details col-span-full flex flex-col grow  -mx-4">
                  {expandedComposer && (
                    <ComposerStandaloneDetails
                      composerId={expandedComposerId}
                      onClose={() => toggleComposer(expandedComposerId)}
                    />
                  )}
                </li>
              )}
              {!expandedComposerId &&
                composers.map((item) => {
                  return (
                    <li className="w-full p-2" key={item.id}>
                      <ComposerListItem
                        composer={item}
                        isExpanded={expandedComposerId === item.id}
                        onToggle={() => toggleComposer(item.id)}
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
              {composers.map((item, index) => {
                const isExpanded = expandedComposerId === item.id;
                const shouldInsertDetails = expandedComposerId && detailsInsertIndex === index;
                return (
                  <Fragment key={item.id}>
                    <li className="w-full h-full inline-flex align-middle justify-center">
                      <ComposerCard composer={item} isExpanded={isExpanded} onToggle={() => toggleComposer(item.id)} />
                    </li>
                    {shouldInsertDetails && (
                      <li className="album-details col-span-full -mx-4">
                        {expandedComposer && (
                          <ComposerExpandedDetails composerId={expandedComposerId} composerOnly={true} />
                        )}
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
