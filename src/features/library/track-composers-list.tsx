import { ComposerCard } from '@/components/composer-card';
import { ComposerExpandedDetails } from '@/components/composer-expanded-details';
import { ComposerListItem } from '@/components/composer-list-item';
import { ComposerStandaloneDetails } from '@/components/composer-standalone-details';
import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useLibrary } from './library';
import { useNavigate, useParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';

export default function TrackComposersList() {
  const navigate = useNavigate();
  const { composers } = useLibrary();
  const isMobile = useIsMobile();
  const [columnSize, setColumnSize] = useState(0);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const [page, setPage] = useState(1);
  const listRef = useRef(null);
  const { composerId } = useParams<{ composerId: string }>();
  const expandedComposerId = composerId ? Number(composerId) : null;
  const expandedComposer =
    expandedComposerId !== null ? (composers.find((composer) => composer.id === expandedComposerId) ?? null) : null;

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
        // window.removeEventListener('resize', measureColumns);
      };
    }
    return undefined;
  }, [composers.length]);

  function toggleComposer(id: number) {
    if (expandedComposerId === id) {
      navigate('/track-composers');
    } else {
      const composer = composers.find((item) => item.id === id);
      if (!composer) {
        // eslint-disable-next-line no-console
        console.error(`Composer with id ${id} not found`);
        return;
      }
      navigate(`/track-composers/${id}/${formatSlug(composer.name)}`);
    }
  }

  const visibleData = useMemo(() => {
    if (pageSize) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return composers.slice(start, end) || [];
    }
    return composers;
  }, [composers, page, pageSize]);

  const clickedArtistIndex = visibleData.findIndex((item) => item.id === expandedComposerId) ?? -1;
  const insertingComposer = visibleData[clickedArtistIndex];
  let detailsInsertIndex =
    clickedArtistIndex >= 0 ? Math.ceil((clickedArtistIndex + 1) / columnSize) * columnSize - 1 : -1;
  if (visibleData.length) {
    if (detailsInsertIndex > visibleData.length) {
      detailsInsertIndex = visibleData.length - 1;
    }
  }

  return (
    <>
      <title>Composers</title>
      {isMobile && (
        <ul className="flex flex-col grow">
          {insertingComposer && (
            <li className="album-details col-span-full flex flex-col grow  -mx-4">
              {expandedComposer && (
                <ComposerStandaloneDetails
                  composer={expandedComposer}
                  onClose={() => toggleComposer(expandedComposer.id)}
                />
              )}
            </li>
          )}
          {!insertingComposer &&
            visibleData.map((item) => {
              return (
                <li className="w-full p-2" key={`mobile-album ${item.id}`}>
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
          {visibleData.map((item, index) => {
            const isExpanded = expandedComposerId === item.id;
            const shouldInsertDetails = detailsInsertIndex === index;
            return (
              <Fragment key={`composer ${item.id}`}>
                <li className="w-full h-full inline-flex align-middle justify-center">
                  <ComposerCard composer={item} isExpanded={isExpanded} onToggle={() => toggleComposer(item.id)} />
                </li>
                {shouldInsertDetails && (
                  <li className="album-details col-span-full -mx-4">
                    {expandedComposer && <ComposerExpandedDetails composer={expandedComposer} composerOnly={true} />}
                  </li>
                )}
              </Fragment>
            );
          })}
        </ul>
      )}
      <PaginationControls page={page} setPage={setPage} items={composers?.length ?? 0} />
    </>
  );
}
