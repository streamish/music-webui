import { AlbumIconImage } from './album-icon-image';
import { Button } from './ui/button';
import { ChevronLast, Circle, Logs, Pause, Play, Repeat, Shuffle, Square, Tally1 } from 'lucide-react';
import { VolumeControl } from './volume-control';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import { useQueue } from '@/features/library/queue';
import { useState } from 'react';
import QueueTable from '@/features/library/queue-table';
import useLockBodyScroll from '@/hooks/use-lock-body-scroll';

export function QueueControls() {
  const {
    queue,
    currentIndex,
    currentTime,
    isPlaying,
    isRepeating,
    isShuffling,
    next,
    previous,
    togglePlay,
    seek,
    setIsRepeating,
    setIsShuffling,
  } = useQueue();
  const [isShowingQueue, setIsShowingQueue] = useState(false);
  useLockBodyScroll(isShowingQueue);

  const toggleQueue = () => setIsShowingQueue((prev) => !prev);

  const stopPlaying = () => {
    togglePlay(false);
    seek(0);
  };

  const setPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * (queue[currentIndex]?.duration || 1);
    seek(position);
  };

  const currentItem = queue[currentIndex];

  return (
    <>
      {isShowingQueue && (
        <div className="fixed overflow-y-scroll bg-muted h-full w-full top-0 left-0 pb-22 z-9999">
          <QueueTable />
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-9999 h-22 bg-muted/95">
        {/* Seek bar */}
        <div className="relative h-2 w-full bg-muted-foreground/40 cursor-pointer" onClick={setPosition}>
          <div className="h-2 bg-primary" style={{ width: `${(currentTime / (currentItem?.duration || 1)) * 100}%` }} />
          <Circle
            className="absolute -top-1 left-0 h-4 w-4 bg-primary rounded-full"
            style={{ left: `${(currentTime / (currentItem?.duration || 1)) * 100}%` }}
          />
        </div>
        <div className="flex h-20 bg-muted/95">
          {/* Playback controls: only take the space they need */}
          <div className="flex flex-none flex-row">
            <div className="flex flex-row">
              <Button
                variant="ghost"
                size="icon-lg"
                className="m-2 h-16 w-16 p-2 hover:bg-foreground/20!"
                onClick={previous}
              >
                <ChevronLast className="h-10! w-10! -scale-x-100" strokeWidth={1} />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                className="m-2 h-16 w-16 p-2 hover:bg-foreground/20!"
                onClick={() => togglePlay(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-12! w-12!" strokeWidth={1} />
                ) : (
                  <Play className="h-12! w-12!" strokeWidth={1} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                className="m-2 h-16 w-16 p-2 hover:bg-foreground/20!"
                onClick={next}
              >
                <ChevronLast className="h-10! w-10!" strokeWidth={1} />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                className="m-2 mr-0 h-16 w-16 p-2 hover:bg-foreground/20!"
                onClick={stopPlaying}
              >
                <Square className="h-10! w-10!" strokeWidth={1} />
              </Button>
            </div>
            <div className="h-20 w-6 flex-none overflow-hidden">
              <Tally1 className="h-20! w-20!" strokeWidth="0.1" />
            </div>
          </div>
          {/* Current media: occupies all remaining space */}
          <div className="flex min-w-0 flex-1 flex-row">
            {queue.length > 0 && currentIndex > -1 && (
              <>
                <div className="m-1 h-18 w-18 flex-none">
                  <AlbumIconImage
                    albumId={currentItem?.album.id}
                    size={100}
                    className="h-18 w-18 border-4 border-muted-foreground"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1 ml-2">
                  <span className="truncate text-md font-medium">{currentItem?.title}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {currentItem?.album.title} — {currentItem?.album.artists.map((artist) => artist.name).join(', ')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {secondsToMinutesAndSeconds(currentTime)} / {secondsToMinutesAndSeconds(currentItem?.duration)}
                  </span>
                </div>
              </>
            )}
          </div>
          {/* Right-side controls: only take the space they need */}
          <div className="flex flex-none flex-row">
            <div className="h-20 w-6 flex-none overflow-hidden">
              <Tally1 className="h-20 w-20" strokeWidth="0.1" />
            </div>
            <div className="flex flex-none flex-row">
              <Button
                variant="ghost"
                size="icon-lg"
                className={[
                  `m-2 h-16 w-16 p-2 hover:bg-foreground/20!`,
                  isShowingQueue ? 'bg-foreground/10!' : '',
                ].join(' ')}
                onClick={toggleQueue}
              >
                <Logs className="h-8! w-8!" strokeWidth={1} />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                className={['m-2 h-16 w-16 p-2 hover:bg-foreground/20!', isRepeating ? 'bg-foreground/10!' : ''].join(
                  ' ',
                )}
                onClick={() => setIsRepeating((prev) => !prev)}
              >
                <Repeat className="h-8! w-8!" strokeWidth={1} />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                className={['m-2 h-16 w-16 p-2 hover:bg-foreground/20!', isShuffling ? 'bg-foreground/10!' : ''].join(
                  ' ',
                )}
                onClick={() => setIsShuffling((prev) => !prev)}
              >
                <Shuffle className="h-8! w-8!" strokeWidth={1} />
              </Button>
            </div>
            <div className="h-20 w-6 flex-none overflow-hidden">
              <Tally1 className="h-20 w-20" strokeWidth="0.1" />
            </div>
            <VolumeControl />
          </div>
        </div>
      </div>
    </>
  );
}
