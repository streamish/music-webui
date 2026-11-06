import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Heart, Music, Radio } from 'lucide-react';
import { IconCard } from '@/components/icon-card';
import { Link, useNavigate, useParams } from 'react-router';
import { ShoutcastContainerListItem } from '@/features/library/shoutcast-container-list-item';
import { ShoutcastGenreEditForm } from '@/features/library/shoutcast-genre-edit-form';
import { ShoutcastItemTypeEnum } from '@/types/api-schema';
import { ShoutcastOnlineStationsTable } from '@/features/library/shoutcast-online-stations-table';
import { ShoutcastStationsTable } from '@/features/library/shoutcast-stations-table';
import { formatSlug } from '@/utils/format';
import { memo, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
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

function MobileRootCrumb() {
  return (
    <>
      <BreadcrumbItem className="gap-0">
        <BreadcrumbLink asChild className="text-xs py-0 px-2">
          <Link to="/shoutcast" aria-label="Breadcrumb: SHOUTcast">
            SHOUTcast
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
    </>
  );
}

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
    { name: 'Live stations', type: 'genres', icon: Radio },
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
      if (!isMobile && expandedContainer === item.type) {
        navigate('/shoutcast');
      } else {
        navigate(`/shoutcast/${item.type}`);
      }
    },
    [expandedContainer, isMobile, navigate],
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

  return (
    <div className="relative">
      <div className={['flex', isMobile ? 'flex-col' : 'flex-row'].join(' ')}>
        {/* Container list:  custom-added stations, favorites, genres */}
        {(!isMobile || !containerParam) && (
          <ul
            className={[
              'flex flex-col overflow-y-auto h-[calc(100vh-9rem)]',
              isMobile ? 'w-full' : 'w-100 min-w-50 mr-2 border-r border-r-muted-foreground/25',
            ].join(' ')}
            aria-label="SHOUTcast containers"
          >
            {containers.map((item) => {
              return (
                <li className="w-full px-2 py-1 first:pt-2 last:pb-2" key={`shoutcast-${item.name}`}>
                  <ShoutcastContainerListItem
                    name={item.name}
                    type={item.type}
                    icon={item.icon}
                    isExpanded={(!isMobile || !!containerParam) && expandedContainer === item.type}
                    onToggle={() => toggleContainer(item)}
                  />
                </li>
              );
            })}
          </ul>
        )}
        {/* Expanded genre showing online stations */}
        {(!isMobile || !!containerParam) && (
          <div className="w-full overflow-y-auto h-[calc(100vh-9rem)]">
            {expandedGenre && (
              <>
                <Breadcrumb className="py-4">
                  <BreadcrumbList className="gap-0 sm:gap-0">
                    {isMobile && <MobileRootCrumb />}
                    <BreadcrumbItem className="gap-0">
                      <BreadcrumbLink asChild className="text-xs py-0 px-2">
                        <Link to="/shoutcast/genres" aria-label="Breadcrumb: Genres">
                          Genres
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="gap-0">
                      <span className="text-xs py-0 px-2" aria-label={`Breadcrumb: ${expandedGenre.name}`}>
                        {expandedGenre.name}
                      </span>
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
                        {isMobile && <MobileRootCrumb />}
                        <BreadcrumbItem className="gap-0">
                          <span className="text-xs py-0 px-2" aria-label="Breadcrumb: Genres">
                            Genres
                          </span>
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
                                  <button
                                    type="button"
                                    onClick={() => toggleGenre(item)}
                                    className={[
                                      'flex w-full items-center gap-4 rounded-lg bg-accent p-2 text-left',
                                      'shadow-sm shadow-foreground/50 transition-colors',
                                      'hover:bg-muted-foreground/50 dark:shadow-background',
                                    ].join(' ')}
                                  >
                                    <item.icon strokeWidth={0.5} className="h-22 w-22" aria-hidden="true" />
                                    <span className="text-sm text-foreground/80">{item.name}</span>
                                  </button>
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
                        {isMobile && <MobileRootCrumb />}
                        <BreadcrumbItem className="gap-0">
                          <span className="text-xs py-0 px-2">
                            {expandedContainer === 'favorites' ? 'My Favorites' : 'My Stations'}
                          </span>
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
        )}
      </div>
    </div>
  );
});
