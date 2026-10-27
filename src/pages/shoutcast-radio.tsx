import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Heart, Music, Radio } from 'lucide-react';
import { IconCard } from '@/components/icon-card';
import { ShoutcastContainerListItem } from '@/features/library/shoutcast-container-list-item';
import { ShoutcastGenreEditForm } from '@/features/library/shoutcast-genre-edit-form';
import { ShoutcastItemListItem } from '@/features/library/shoutcast-item-list-item';
import { ShoutcastItemTypeEnum } from '@/types/api-schema';
import { ShoutcastOnlineStationsTable } from '@/features/library/shoutcast-online-stations-table';
import { ShoutcastStationsTable } from '@/features/library/shoutcast-stations-table';
import { formatSlug } from '@/utils/format';
import { memo, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams } from 'react-router';
import { useShoutcastFavorites, useShoutcastGenres, useShoutcastStations } from '@/features/library/api/shoutcast';
import type { LucideIcon } from 'lucide-react';

type ContainerType = 'stations' | 'favorites' | 'genres';

type ShoutcastContainer = {
  name: string;
  type: ContainerType;
  icon: LucideIcon;
};

type ShoutcastItem = ShoutcastContainer & {
  id: number;
  icon: LucideIcon;
  url?: string;
};

export default memo(() => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { container: containerParam, genreId: genreParam } = useParams<{ container: string; genreId?: string }>();
  const { data: favorites } = useShoutcastFavorites();
  const { data: stations } = useShoutcastStations();
  const { data: genres } = useShoutcastGenres();
  const containers: ShoutcastContainer[] = [
    { name: 'My stations', type: 'stations', icon: Music },
    { name: 'My favorites', type: 'favorites', icon: Heart },
    { name: 'All genres', type: 'genres', icon: Radio },
  ];
  const expandedContainer = (containerParam as ContainerType) || 'stations';
  const expandedGenreId = genreParam ? Number(genreParam) : 0;
  const expandedGenre = genres?.find((genre) => genre.id === expandedGenreId);
  const items: ShoutcastItem[] = (() => {
    switch (expandedContainer) {
      case 'stations':
        return (
          stations?.map((station) => {
            return {
              id: station.id,
              name: station.title,
              url: station.url,
              type: 'stations',
              icon: Music,
            };
          }) || []
        );
      case 'favorites':
        return (
          favorites?.map((favorite) => {
            return {
              id: favorite.shoutcastStation?.id || 0,
              name: favorite.shoutcastStation?.title || favorite.shoutcastStation?.url || '',
              url: favorite.shoutcastStation?.url,
              type: 'favorites',
              icon: Music,
            };
          }) || []
        );
      case 'genres':
        return (
          genres?.map((genre) => {
            return {
              id: genre.id,
              name: genre.name,
              type: 'genres',
              icon: Music,
            };
          }) || []
        );
      default:
        return [];
    }
  })();

  const toggleContainer = useCallback(
    (item: ShoutcastContainer) => {
      if (expandedContainer === item.type) {
        navigate('/shoutcast');
      } else {
        navigate(`/shoutcast/${item.type}`);
      }
    },
    [expandedContainer, navigate],
  );

  const toggleGenre = useCallback(
    (genre: ShoutcastItem) => {
      if (expandedGenreId === genre.id) {
        navigate('/shoutcast/genres');
      } else {
        navigate(`/shoutcast/genres/${genre.id}/${formatSlug(genre.name)}`);
      }
    },
    [expandedGenreId, navigate],
  );

  const clickCrumb = useCallback(
    (id: number) => {
      if (id === 0) {
        navigate('/shoutcast/genres');
      } else {
        navigate(`/shoutcast/genres/${id}/${formatSlug(expandedGenre?.name || '')}`);
      }
    },
    [navigate],
  );

  return (
    <div className="relative">
      <div className={['flex', isMobile ? 'flex-col' : 'flex-row'].join(' ')}>
        {/* Container list:  custom-added stations, favorites, genres */}
        {!isMobile && (
          <ul
            className={[
              'flex flex-col overflow-y-auto h-[calc(100vh-9rem)]',
              isMobile ? '' : 'max-w-100 min-w-50',
              'bg-accent/50',
              'mr-2',
            ].join(' ')}
          >
            {containers.map((item) => {
              return (
                <li className="w-full px-2 py-1 first:pt-2 last:pb-2" key={`shoutcast-${item.name}`}>
                  <ShoutcastContainerListItem
                    name={item.name}
                    type={item.type}
                    icon={item.icon}
                    isExpanded={expandedContainer === item.type}
                    onToggle={() => toggleContainer(item)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        {/* Expanded genre showing online stations */}
        <div className="pb-40 w-full overflow-y-auto h-[calc(100vh-9rem)]">
          {expandedGenre && (
            <>
              <Breadcrumb className="py-4">
                <BreadcrumbList className="gap-0 sm:gap-0">
                  <BreadcrumbItem className="gap-0">
                    <BreadcrumbLink
                      onClick={() => clickCrumb(0)}
                      aria-label={`Breadcrumb: Genres`}
                      className="text-xs py-0 px-2 cursor-pointer"
                    >
                      Genres
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="gap-0">
                    <BreadcrumbLink
                      onClick={() => clickCrumb(expandedGenre.id)}
                      aria-label={`Breadcrumb: ${expandedGenre.name}`}
                      className="text-xs py-0 px-2 cursor-pointer"
                    >
                      {expandedGenre.name}
                    </BreadcrumbLink>
                    <ShoutcastGenreEditForm genre={expandedGenre} />
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <ShoutcastOnlineStationsTable genreId={expandedGenreId} />
            </>
          )}
          {/* Container details */}
          {!expandedGenreId && (
            <>
              {expandedContainer === 'genres' && (
                <>
                  <Breadcrumb className="py-4">
                    <BreadcrumbList className="gap-0 sm:gap-0">
                      <BreadcrumbItem className="gap-0">
                        <BreadcrumbLink
                          onClick={() => clickCrumb(0)}
                          aria-label={`Breadcrumb: Genres`}
                          className="text-xs py-0 px-2 cursor-pointer"
                        >
                          Genres
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <div className="pt-2">
                    {isMobile && (
                      <ul className="flex flex-col grow" aria-label="Folder list">
                        {items.length > 0 &&
                          items.map((item: ShoutcastItem, index) => {
                            return (
                              <li
                                className="w-full p-2"
                                key={`mobile-shoutcast ${item.id}-${index}`}
                                aria-label={`Shoutcast ${item.type} ${item.name}`}
                              >
                                <ShoutcastItemListItem icon={item.icon} text={item.name} allowEdit={true} />
                              </li>
                            );
                          })}
                      </ul>
                    )}
                    {!isMobile && (
                      <ul
                        className={[
                          'grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]',
                          'md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]',
                          'lg:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] ',
                          'gap-4 mx-4',
                        ].join(' ')}
                        aria-label="Folder list"
                      >
                        {items.map((item: ShoutcastItem, index) => {
                          return (
                            <li
                              className="w-full h-full inline-flex align-middle justify-center"
                              key={`shoutcast ${item.id}-${index}`}
                            >
                              <IconCard text={item.name} icon={Music} onToggle={() => toggleGenre(item)} />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
              {expandedContainer !== 'genres' && (
                <>
                  <Breadcrumb className="py-4">
                    <BreadcrumbList className="gap-0 sm:gap-0">
                      <BreadcrumbItem className="gap-0">
                        <BreadcrumbLink
                          onClick={() => clickCrumb(0)}
                          aria-label={`Breadcrumb: Genres`}
                          className="text-xs py-0 px-2 cursor-pointer"
                        >
                          {expandedContainer === 'favorites' ? 'My Favorites' : 'My Stations'}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <ShoutcastStationsTable
                    stations={items.map((item: ShoutcastItem) => {
                      return {
                        id: item.id,
                        title: item.name,
                        url: item.url || '',
                        type: ShoutcastItemTypeEnum.station,
                      };
                    })}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
