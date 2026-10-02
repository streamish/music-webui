import { AlbumCard } from '@/components/album-card';
import { AlbumExpandedDetails } from '@/components/album-expanded-details';
import { AlbumListItem } from '@/components/album-list-item';
import { AlbumStandaloneDetails } from '@/components/album-standalone-details';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useAlbums } from '@/hooks/user/use-albums';
import { useGridColumnCount } from '@/hooks/use-grid-column-count';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePreferences } from '@/hooks/use-preferences';

export default function AlbumsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { albumId } = useParams<{ albumId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const { listRef, columnCount } = useGridColumnCount();
  const [query, setQuery] = useState({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  });
  const { albums, refetchAlbums, total } = useAlbums(query);
  const expandedAlbumId = albumId ? Number(albumId) : null;
  const expandedAlbum =
    expandedAlbumId !== null ? (albums.find((album) => album.id === expandedAlbumId) ?? null) : null;
  const clickedIndex = albums.findIndex((item) => item.id === expandedAlbumId) ?? -1;
  let detailsInsertIndex =
    columnCount > 0 && clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnCount) * columnCount - 1 : -1;
  if (albums.length) {
    if (detailsInsertIndex > albums.length) {
      detailsInsertIndex = albums.length - 1;
    }
  }

  const getAlbumUrl = (id: number) => {
    const album = albums.find((item) => item.id === id);
    return `/albums/${id}/${formatSlug(album?.title ?? '')}`;
  };

  const toggleAlbum = useCallback(
    (id: number) => {
      const newUrl = id === expandedAlbumId ? '/albums' : getAlbumUrl(id);
      navigate(newUrl);
    },
    [albums, expandedAlbumId, navigate],
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

  useEffect(() => {
    if (!expandedAlbum || expandedAlbumId === null) {
      return;
    }
    let nextPath = expandedAlbumId === null ? '/track-albums' : getAlbumUrl(expandedAlbumId);
    if (pageNumber > 1) {
      nextPath += `?page=${pageNumber}`;
    }
    const currentPath = window.location.pathname;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [expandedAlbum, expandedAlbumId, navigate]);

  return (
    <div className="relative">
      <title>Albums</title>
      {total == null ? (
        <p className="text-white-500">Loading…</p>
      ) : (
        <>
          {!isMobile && (
            <PageHeader>
              <PaginationControls page={pageNumber} setPage={setPage} items={total} />
            </PageHeader>
          )}
          {isMobile && (
            <ul ref={listRef} className="flex flex-col grow overflow-y-scroll h-[calc(100vh-11rem)]">
              {expandedAlbumId && (
                <li className="album-details col-span-full flex flex-col grow  -mx-4">
                  {expandedAlbum && (
                    <AlbumStandaloneDetails
                      albumId={expandedAlbumId}
                      onClose={() => toggleAlbum(expandedAlbumId)}
                      onEdit={refetchAlbums}
                    />
                  )}
                </li>
              )}
              {!expandedAlbumId &&
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
                'gap-4 mx-4',
                'overflow-y-scroll h-[calc(100vh-11rem)]',
              ].join(' ')}
            >
              {albums.map((item, index) => {
                const isExpanded = expandedAlbumId === item.id;
                const shouldInsertDetails =
                  expandedAlbumId &&
                  (detailsInsertIndex === index ||
                    (index === albums.length - 1 && detailsInsertIndex === albums.length));
                return (
                  <Fragment key={item.id}>
                    <li className="w-full h-full inline-flex align-middle justify-center">
                      <AlbumCard album={item} isExpanded={isExpanded} onToggle={() => toggleAlbum(item.id)} />
                    </li>
                    {shouldInsertDetails && (
                      <li className="album-details col-span-full -mx-4 pt-4">
                        <AlbumExpandedDetails albumId={expandedAlbumId} onEdit={refetchAlbums} />
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
