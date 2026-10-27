import { AlbumBrowser } from '@/features/library/album-browser';
import { PageHeader } from '@/layouts/user-layout';
import { PaginationControls } from '@/components/pagination-controls';
import { formatSlug } from '@/utils/format';
import { useAlbums } from '@/features/library/api/albums';
import { useCallback, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { usePreferences } from '@/hooks/use-preferences';

export default function AlbumsPage() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { albumId } = useParams<{ albumId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const query = {
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  };
  const { data: { albums, total } = { albums: [], total: 0 } } = useAlbums(query);
  const expandedAlbumId = albumId ? Number(albumId) : null;
  const expandedAlbum =
    expandedAlbumId !== null ? (albums.find((album) => album.id === expandedAlbumId) ?? null) : null;

  const getAlbumUrl = useCallback(
    (id: number) => {
      const album = albums.find((item) => item.id === id);
      const path = `/albums/${id}/${formatSlug(album?.title ?? '')}`;
      return pageNumber > 1 ? `${path}?page=${pageNumber}` : path;
    },
    [albums, pageNumber],
  );

  const toggleAlbum = useCallback(
    (id: number) => {
      let newUrl = getAlbumUrl(id);
      if (id === expandedAlbumId) {
        newUrl = pageNumber > 1 ? `/albums?page=${pageNumber}` : '/albums';
      }
      navigate(newUrl);
    },
    [expandedAlbumId, getAlbumUrl, navigate, pageNumber],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('page', String(nextPage));
        return next;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!expandedAlbum || expandedAlbumId === null) {
      return;
    }
    const nextPath = getAlbumUrl(expandedAlbumId);
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [expandedAlbum, expandedAlbumId, getAlbumUrl, navigate]);

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
          <AlbumBrowser albums={albums} expandedAlbumId={expandedAlbumId} onToggleAlbum={toggleAlbum} />
        </>
      )}
    </div>
  );
}
