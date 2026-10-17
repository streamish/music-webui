import { Circle } from 'lucide-react';
import { useQueueActions, useQueueData, useQueuePlayback } from '@/features/library/queue';
import type { components } from '@/types/api-schema';

type Track = components['schemas']['LibraryTrackDto'];

export function PlaybackSeekBar() {
  const { queue, currentIndex } = useQueueData();
  const { currentTime } = useQueuePlayback();
  const { seek } = useQueueActions();
  const currentItem = queue[currentIndex] as Track;

  const setPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentItem?.duration) {
      return;
    }
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * (currentItem.duration || 1);
    seek(position);
  };
  return (
    <div className="relative h-2 w-full bg-muted-foreground/40 cursor-pointer" onClick={setPosition}>
      <div
        className="h-2 bg-muted-foreground"
        style={{ width: `${((currentTime + 1) / (currentItem?.duration || 1)) * 100}%` }}
      />
      {currentItem?.duration && (
        <Circle
          className={[
            'absolute -top-1 left-0 h-4 w-4',
            'bg-muted-foreground rounded-full fill-muted-foreground stroke-muted/25',
          ].join(' ')}
          style={{ left: `${(currentTime / (currentItem?.duration || 1)) * 100}%` }}
        />
      )}
    </div>
  );
}
