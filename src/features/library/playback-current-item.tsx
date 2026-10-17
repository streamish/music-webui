import { AlbumIconImage } from '@/features/library/album-icon-image';
import { RadioIcon } from 'lucide-react';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { useQueueData, useQueuePlayback } from './queue';
import api from '@/lib/api';

export function useCurrentPlaying(shoutcastStationUrl: string) {
  return useQuery({
    enabled: !!shoutcastStationUrl,
    refetchInterval: 1000 * 10,
    queryKey: ['current-playing', shoutcastStationUrl],
    queryFn: async () => {
      const { data, error } = await api.get('/api/retrieve-shoutcast-playing', {
        params: { query: { shoutcastStationUrl } },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No album returned');
      }
      return data.title || 'Unknown Title';
    },
  });
}

export function PlaybackCurrentItem() {
  const { queue, currentIndex } = useQueueData();
  const { currentTime } = useQueuePlayback();
  const currentItem = queue[currentIndex];
  const stationUrl = currentItem && 'url' in currentItem ? currentItem.url : '';
  const { data: currentPlayingTitle } = useCurrentPlaying(stationUrl);

  if (!currentItem) {
    return null;
  }

  const isAlbum = 'albumId' in currentItem;
  const currentTitle = isAlbum ? currentItem.albumTitle : (currentPlayingTitle ?? 'Loading...');
  const currentAttribution = isAlbum
    ? `${currentItem.albumTitle} — ${currentItem.albumArtists.map((artist) => artist.name).join(', ')}`
    : '';
  const currentProgress = isAlbum
    ? `${secondsToMinutesAndSeconds(currentTime)} / ${secondsToMinutesAndSeconds(currentItem.duration)}`
    : '';

  return (
    <div className="flex flex-row items-center justify-center">
      <div className="m-1 h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 flex-none">
        {isAlbum ? (
          <AlbumIconImage
            albumId={currentItem.albumId}
            size={100}
            className={
              'h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 border-2 lg:border-4 border-muted-foreground'
            }
          />
        ) : (
          <RadioIcon
            className={
              'h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 border-2 lg:border-4 border-muted-foreground'
            }
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 ml-2">
        <span className="truncate text-md font-medium">{currentTitle}</span>
        <span className="hidden lg:block truncate text-sm text-muted-foreground">{currentAttribution}</span>
        <span className="text-sm text-muted-foreground">{currentProgress}</span>
      </div>
    </div>
  );
}
