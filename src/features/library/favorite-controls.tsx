import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import api from '@/lib/api';

type Entity = {
  // the ID of a given entity (album, track, association, folder, or station)
  id: number;
  // an existing favorite ID
  favoriteId?: number;
  // a SHOUTcast station URL that has not been saved to the db (eg within genre)
  url?: string;
  title?: string;
};

export function FavoriteControls({
  album,
  association,
  folder,
  station,
  track,
}: {
  album?: Entity;
  association?: Entity;
  folder?: Entity;
  station?: Entity;
  track?: Entity;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isFilled =
    album?.favoriteId || track?.favoriteId || association?.favoriteId || folder?.favoriteId || station?.favoriteId;

  const entity = (() => {
    return album || track || association || folder || station || undefined;
  })();
  const entityType = (() => {
    if (album) {
      return 'album';
    }
    if (track) {
      return 'track';
    }
    if (association) {
      return 'association';
    }
    if (folder) {
      return 'folder';
    }
    if (station) {
      return 'shoutcast-station';
    }
    return undefined;
  })();

  if (!entity || !entityType) {
    throw new Error('Favorite controls embedded without entity');
  }

  const setFavorite = async () => {
    if (entityType === 'shoutcast-station') {
      return api.put(`/api/set-shoutcast-station-favorite`, {
        params: {
          query: {
            shoutcastStationId: entity.id || undefined,
            shoutcastStationUrl: entity.url,
            shoutcastStationTitle: entity.title,
          },
        },
      });
    }
    return api.put(`/api/set-${entityType}-favorite`, {
      params: {
        query: {
          id: entity.id,
        },
      },
    });
  };

  const handleSubmit = async () => {
    if (entity.favoriteId) {
      try {
        const result = await api.delete(`/api/delete-favorite`, {
          params: {
            query: {
              id: entity.favoriteId,
            },
          },
        });
        if (result.data?.success) {
          entity.favoriteId = undefined;
          return;
        }
        if (result.error) {
          throw new Error(result.error.error, {
            cause: result.error.message,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while deleting favorite:', error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    } else {
      try {
        const result = await setFavorite();
        if (result.data?.success) {
          entity.favoriteId = result.data.favoriteId;
          return;
        }
        if (result.error) {
          throw new Error(result.error.error, {
            cause: result.error.message,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error occurred while creating favorite:', error);
        toast.error('An internal server error occurred. Please try again later.');
      }
    }
  };

  return (
    <Button
      aria-label={`Toggle ${album ? 'album' : 'track'} favorite`}
      className={[
        `px-2 mb-4 py-1 rounded text-xs uppercase text-foreground/50 hover:text-foreground/80`,
        album || association ? 'ml-2' : '',
        folder ? 'mb-0' : '',
      ].join(' ')}
      onClick={() => handleSubmit()}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      variant="ghost"
    >
      <Heart
        className={[
          'h-6 w-6 lg:h-5 lg:w-5 cursor-pointer stroke-fill-background/25 dark:stroke-fill-foreground/25',
          isFilled && !isHovered ? 'fill-background/50! dark:fill-foreground/50!' : '',
          isHovered ? 'fill-background! dark:fill-foreground!' : '',
        ].join(' ')}
      />
    </Button>
  );
}
