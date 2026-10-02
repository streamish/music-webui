import { AlbumCard } from '@/components/album-card';
import { AlbumExpandedDetails } from '@/components/album-expanded-details';
import { AlbumListItem } from '@/components/album-list-item';
import { ArrowLeftCircle } from 'lucide-react';
import { AssociationEditForm } from '@/features/library/association-edit-form';
import { AssociationListItem } from '@/components/association-list-item';
import { AssociationTypeEnum } from '@/types/api-schema';
import { Button } from '@/components/ui/button';
import { Fragment, memo, useCallback, useEffect, useState } from 'react';
import { TrackTable } from '@/components/track-table';
import { formatSlug } from '@/utils/format';
import { useAlbumAssociations, useAssociation, useTrackAssociations } from '@/hooks/user/use-associations';
import { useGridColumnCount } from '@/hooks/use-grid-column-count';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

type ViewingGroup = 'album-artists' | 'track-artists' | 'track-composers' | 'track-genres';

function getIsAlbumArtists(pathname: string) {
  return pathname.includes('album-artists');
}

function getAssociationType(pathname: string) {
  if (pathname.includes('album-artists')) {
    return AssociationTypeEnum.artist;
  }
  if (pathname.includes('track-artists')) {
    return AssociationTypeEnum.artist;
  }
  if (pathname.includes('track-composers')) {
    return AssociationTypeEnum.composer;
  }
  if (pathname.includes('track-genres')) {
    return AssociationTypeEnum.genre;
  }
  throw new Error('Unknown association type');
}

function getGroupUrl(associationType: AssociationTypeEnum, isAlbumArtists: boolean) {
  switch (associationType) {
    case AssociationTypeEnum.artist:
      return isAlbumArtists ? 'album-artists' : 'track-artists';
    case AssociationTypeEnum.composer:
      return 'track-composers';
    case AssociationTypeEnum.genre:
      return 'track-genres';
    default:
      return '';
  }
}

function getViewingGroup(associationType: AssociationTypeEnum, isAlbumArtists: boolean): ViewingGroup {
  switch (associationType) {
    case AssociationTypeEnum.artist:
      return isAlbumArtists ? 'album-artists' : 'track-artists';
    case AssociationTypeEnum.composer:
      return 'track-composers';
    case AssociationTypeEnum.genre:
      return 'track-genres';
    default:
      throw new Error('Unknown viewing group');
  }
}

function usePageAssociations({
  isAlbumArtists,
  associationType,
}: {
  isAlbumArtists: boolean;
  associationType: AssociationTypeEnum;
}) {
  const options = {
    limit: 100_000,
    offset: 0,
    associationType,
  };
  const albumResult = useAlbumAssociations({
    ...options,
    enabled: isAlbumArtists,
  });
  const trackResult = useTrackAssociations({
    ...options,
    enabled: !isAlbumArtists,
  });
  return isAlbumArtists ? albumResult : trackResult;
}

export const AssociationsPage = memo(() => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const associationType = getAssociationType(pathname);
  const isAlbumArtists = getIsAlbumArtists(pathname);
  const groupUrl = getGroupUrl(associationType, isAlbumArtists);
  const navigate = useNavigate();
  const { associationId, albumId } = useParams<{ associationId: string; albumId?: string }>();
  const [searchParams] = useSearchParams();
  const pageNumber = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const { listRef, columnCount } = useGridColumnCount();
  const { associations, refetch: refetchAssociations } = usePageAssociations({
    isAlbumArtists,
    associationType,
  });
  const expandedAssociationId = associationId ? Number(associationId) : undefined;
  const { association: expandedAssociation, refetch: refetchAssociation } = useAssociation({
    id: expandedAssociationId || 0,
  });
  const [viewingGroup, setViewingGroup] = useState<ViewingGroup>(getViewingGroup(associationType, isAlbumArtists));
  const expandedAlbumId = albumId ? Number(albumId) : null;
  const expandedAlbum =
    expandedAlbumId !== null
      ? (expandedAssociation?.albumArtistCredits.find((album) => album.id === expandedAlbumId) ?? null)
      : null;
  const clickedIndex = expandedAssociation?.albumArtistCredits.findIndex((item) => item.id === expandedAlbumId) ?? -1;
  let detailsInsertIndex =
    columnCount > 0 && clickedIndex >= 0 ? Math.ceil((clickedIndex + 1) / columnCount) * columnCount - 1 : -1;
  if (expandedAssociation?.albumArtistCredits.length) {
    if (detailsInsertIndex >= expandedAssociation.albumArtistCredits.length) {
      detailsInsertIndex = expandedAssociation.albumArtistCredits.length - 1;
    }
  }

  const getAssociationUrl = useCallback(
    (id: number) => {
      const association = associations.find((item) => item.id === id);
      return `/${groupUrl}/${id}/${formatSlug(association?.name ?? '')}`;
    },
    [associations, groupUrl],
  );

  const getAlbumUrl = useCallback(
    (id: number) => {
      const album = expandedAssociation?.albumArtistCredits.find((a) => a.id === id);
      const associationUrl = getAssociationUrl(expandedAssociationId!);
      return `${associationUrl}/${id}/${formatSlug(album?.title ?? '')}`;
    },
    [expandedAssociation, expandedAssociationId, getAssociationUrl],
  );

  const refresh = useCallback(() => {
    refetchAssociations();
    refetchAssociation();
  }, [refetchAssociations, refetchAssociation]);

  const toggleArtist = useCallback(
    (id: number) => {
      const newUrl = getAssociationUrl(id);
      navigate(newUrl);
    },
    [getAssociationUrl, navigate],
  );

  const toggleAlbum = useCallback(
    (id: number) => {
      const newUrl =
        expandedAssociationId && id === expandedAlbumId ? getAssociationUrl(expandedAssociationId) : getAlbumUrl(id);
      navigate(newUrl);
    },
    [expandedAlbumId, expandedAssociationId, getAlbumUrl, getAssociationUrl, navigate],
  );

  const onBack = useCallback(() => {
    if (albumId && expandedAssociationId != null) {
      navigate(getAssociationUrl(expandedAssociationId));
      return;
    }
    if (expandedAssociationId != null) {
      navigate(`/${groupUrl}`);
      return;
    }
    navigate(`/${groupUrl}`);
  }, [albumId, expandedAssociationId, getAssociationUrl, groupUrl, navigate]);

  useEffect(() => {
    if (!expandedAssociation || expandedAssociationId === null) {
      return;
    }
    let nextPath = !expandedAssociationId ? `/${groupUrl}` : getAssociationUrl(expandedAssociationId);
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
  }, [associationType, expandedAssociation, expandedAlbum, navigate]);

  useEffect(() => {
    setViewingGroup(() => {
      return getViewingGroup(associationType, isAlbumArtists);
    });
  }, [expandedAssociationId]);

  useEffect(() => {
    let stem = '';
    switch (associationType) {
      case AssociationTypeEnum.artist:
        stem = isAlbumArtists ? 'Album Artists' : 'Artists';
        break;
      case AssociationTypeEnum.composer:
        stem = 'Composers';
        break;
      case AssociationTypeEnum.genre:
        stem = 'Genres';
        break;
      default:
        stem = '';
    }
    if (stem && expandedAssociation?.name) {
      document.title = `${stem}: ${expandedAssociation?.name}`;
    } else {
      document.title = 'Loading...';
    }
  }, [associationType, expandedAssociation?.name, isAlbumArtists]);

  const tabButtons = (() => {
    if (associationType === AssociationTypeEnum.genre) {
      return [];
    }
    const composerCredits =
      expandedAssociation?.composerCredits.reduce((acc, curr) => acc + (curr?.tracks.length ?? 0), 0) ?? 0;
    const composer =
      composerCredits > 0 ? (
        <Button
          value="composer"
          className={[
            `px-4 hover:bg-muted/50`,
            viewingGroup === 'track-composers' ? 'bg-background/90! border-transparent' : '',
          ].join(' ')}
          variant={viewingGroup === 'track-composers' ? 'outline' : 'ghost'}
          onClick={() => setViewingGroup('track-composers')}
        >
          Composer credits ({composerCredits})
        </Button>
      ) : (
        <></>
      );
    const trackCredits =
      expandedAssociation?.artistCredits.reduce((acc, curr) => acc + (curr?.tracks.length ?? 0), 0) ?? 0;
    const track =
      trackCredits > 0 ? (
        <Button
          value="track"
          className={[
            `px-4 hover:bg-muted/50`,
            viewingGroup === 'track-artists' ? 'bg-background/90! border-transparent' : '',
          ].join(' ')}
          variant={viewingGroup === 'track-artists' ? 'outline' : 'ghost'}
          onClick={() => setViewingGroup('track-artists')}
        >
          Track credits ({trackCredits})
        </Button>
      ) : (
        <></>
      );
    const albumCredits = expandedAssociation?.albumArtistCredits.length ?? 0;
    const album =
      albumCredits > 0 ? (
        <Button
          value="album"
          className={[
            `px-4 hover:bg-muted/50`,
            viewingGroup === 'album-artists' ? 'bg-background/90! border-transparent' : '',
          ].join(' ')}
          variant={viewingGroup === 'album-artists' ? 'outline' : 'ghost'}
          onClick={() => setViewingGroup('album-artists')}
        >
          Album credits ({albumCredits})
        </Button>
      ) : (
        <></>
      );
    switch (associationType) {
      case AssociationTypeEnum.artist:
        return isAlbumArtists ? [album, track, composer] : [album, track, composer];
      case AssociationTypeEnum.composer:
        return [composer, track, album];
      default:
        return [];
    }
  })();

  if (!associations.length) {
    return <></>;
  }

  let albums;
  switch (viewingGroup) {
    case 'album-artists':
      albums = expandedAssociation?.albumArtistCredits || [];
      break;
    case 'track-artists':
      albums = expandedAssociation?.artistCredits || [];
      break;
    case 'track-composers':
      albums = expandedAssociation?.composerCredits || [];
      break;
    case 'track-genres':
    default:
      albums = expandedAssociation?.genreCredits || [];
      break;
  }
  return (
    <div className="relative">
      <div className={['flex', isMobile ? 'flex-col' : 'flex-row'].join(' ')}>
        {/* Associations list */}
        {(!isMobile || !expandedAssociation) && (
          <ul
            className={['flex flex-col overflow-y-scroll pb-2 h-[calc(100vh-12rem)]', isMobile ? '' : 'max-w-100'].join(
              ' ',
            )}
          >
            {associations.map((item) => {
              return (
                <li className="w-full px-2" key={`association-${item.id}`}>
                  <AssociationListItem
                    association={item}
                    isExpanded={expandedAssociationId === item.id}
                    onToggle={() => toggleArtist(item.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        {/* Association details */}
        <div className="w-full overflow-y-scroll h-[calc(100vh-11rem)]">
          <div className="flex flex-row justify-between items-center">
            <div className="w-full flex flex-row px-4 md:px-0 lg:px-0">
              <h2 className="text-lg font-semibold">{expandedAssociation?.name || 'Loading...'}</h2>
              {expandedAssociation && (
                <AssociationEditForm
                  association={expandedAssociation}
                  associationType={associationType}
                  onSave={refresh}
                />
              )}
            </div>
            {isMobile && (
              <menu className="opacity-75 w-full text-right">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="inline-flex flex-row w-fit self-start m-2"
                  aria-label="Back button"
                >
                  <ArrowLeftCircle />
                  Back
                </Button>
              </menu>
            )}
          </div>
          {viewingGroup !== 'track-genres' && (
            <>
              {/* Group buttons */}
              <menu className="p-1 bg-foreground/10 inline-block rounded-lg">
                {tabButtons.map((button, index) => (
                  <li key={`button-${index}`} className="inline-block">
                    {button}
                  </li>
                ))}
              </menu>
              {viewingGroup === 'album-artists' && (
                <>
                  {isMobile && (
                    <ul className="flex flex-col grow overflow-y-scroll h-[calc(100vh-11rem)]">
                      {albums.map((item, index) => {
                        const shouldInsertDetails = expandedAlbumId && detailsInsertIndex === index;
                        return (
                          <>
                            {!expandedAlbumId && (
                              <li className="w-full p-2" key={item.id}>
                                <AlbumListItem
                                  album={item}
                                  isExpanded={expandedAlbumId === item.id}
                                  onToggle={() => toggleAlbum(item.id)}
                                />
                              </li>
                            )}
                            {shouldInsertDetails && (
                              <li className="album-details col-span-full pt-4">
                                <AlbumExpandedDetails albumId={expandedAlbumId} onEdit={refresh} />
                              </li>
                            )}
                          </>
                        );
                      })}
                    </ul>
                  )}
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
                      ].join(' ')}
                    >
                      {albums.map((item, index) => {
                        const isExpanded = expandedAssociationId === item.id;
                        const shouldInsertDetails = expandedAlbumId && detailsInsertIndex === index;
                        return (
                          <Fragment key={`albums-${item.id}`}>
                            <li className="w-full inline-flex align-middle justify-center">
                              <AlbumCard album={item} isExpanded={isExpanded} onToggle={() => toggleAlbum(item.id)} />
                            </li>
                            {shouldInsertDetails && (
                              <li className="album-details col-span-full pt-4">
                                <AlbumExpandedDetails albumId={expandedAlbumId} onEdit={refresh} />
                              </li>
                            )}
                          </Fragment>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
              {viewingGroup !== 'album-artists' && (
                <div ref={listRef} className="w-full" key={expandedAssociationId}>
                  <TrackTable albums={albums} onEdit={refresh} />
                </div>
              )}
            </>
          )}
          {viewingGroup === 'track-genres' && (
            <div ref={listRef} className="w-full" key={expandedAssociationId}>
              <TrackTable albums={expandedAssociation?.genreCredits || []} onEdit={refresh} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
