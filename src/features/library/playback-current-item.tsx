import { AlbumIconImage } from '@/components/album-icon-image';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import { useQueueData, useQueuePlayback } from './queue';

export function PlaybackCurrentItem() {
  const { queue, currentIndex } = useQueueData();
  const { currentTime } = useQueuePlayback();
  const currentItem = queue[currentIndex];
  if (!currentItem) {
    return null;
  }
  return (
    <div className="flex flex-row items-center justify-center">
      <div className="m-1 h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 flex-none">
        <AlbumIconImage
          albumId={currentItem?.albumId}
          size={100}
          className={[
            `h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16`,
            `border-2 lg:border-4 border-muted-foreground`,
          ].join(' ')}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 ml-2">
        <span className="truncate text-md font-medium">{currentItem?.title}</span>
        <span className="hidden lg:block truncate text-sm text-muted-foreground">
          {currentItem?.albumTitle} — {currentItem?.albumArtists.map((artist) => artist.name).join(', ')}
        </span>
        <span className="text-sm text-muted-foreground">
          {secondsToMinutesAndSeconds(currentTime)} / {secondsToMinutesAndSeconds(currentItem?.duration)}
        </span>
      </div>
    </div>
  );
}
