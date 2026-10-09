import { AlbumFullImage } from '@/features/library/album-full-image';
import { AlbumIconImage } from '@/features/library/album-icon-image';
import { Button } from '@/components/ui/button';
import { Logs, Repeat, Shuffle } from 'lucide-react';
import { getContrastingTextColor } from '@/utils/color';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useQueueActions, useQueueData, useQueuePlayback } from './queue';

export default function QueueTable() {
  const { queue, currentIndex } = useQueueData();
  const { isPlaying } = useQueuePlayback();
  const { togglePlay, seek, setCurrentIndex } = useQueueActions();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [contrastingColor, setContrastingColor] = useState('#000000');
  const { currentTime, isRepeating, isShuffling } = useQueuePlayback();
  const { setIsRepeating, setIsShuffling } = useQueueActions();
  const { isMobile } = useIsMobile();
  const [isShowingQueue, setIsShowingQueue] = useState(false);
  const toggleQueue = () => setIsShowingQueue((prev) => !prev);
  const currentItem = queue[currentIndex];
  const iconSize = isMobile ? 12 : 16;
  const iconPadding = isMobile ? 1 : 2;
  const iconMargin = isMobile ? 1 : 2;

  useEffect(() => {
    setSelectedColor(currentItem?.albumCoverImageMuted || '#000000');
    setContrastingColor(currentItem?.albumCoverImageDarkMuted || '#000000');
  }, [currentItem]);

  const selectItem = (index: number, startPlaying = false) => {
    const restartPlaying = isPlaying;
    if (isPlaying) {
      togglePlay(false);
    }
    setCurrentIndex(index);
    seek(0);
    if (restartPlaying || startPlaying) {
      togglePlay(true);
    }
  };

  const playingQueue = (
    <ul className="flex grow flex-col w-full h-full overflow-y-auto p-4">
      {queue.map((item, index) => (
        <li
          aria-label={`Queue item ${index + 1}`}
          className={[
            `w-full p-2 border-b last-of-type:border-0 bg-foreground/1 cursor-pointer`,
            index === currentIndex ? 'bg-foreground/10' : '',
          ].join(' ')}
          key={`queue-track-${item.id}-${index}`}
          onClick={() => selectItem(index)}
          onDoubleClick={() => selectItem(index, true)}
        >
          <div
            className="grid w-full grid-cols-[2fr_1fr_auto] items-center"
            style={{
              color: `${getContrastingTextColor(contrastingColor)}`,
              mixBlendMode: 'screen',
              transition: 'color 700ms ease-in-out',
            }}
          >
            <div className="min-w-0">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <span className="block text-md text-foreground/80">{item.albumTitle}</span>
            </div>
            <span className="mb-2 whitespace-nowrap text-sm text-foreground/60">
              {item.albumArtists.map((artist) => artist.name).join(', ')}
            </span>
            <span className="whitespace-nowrap pr-4 text-right text-sm text-foreground/80">
              {secondsToMinutesAndSeconds(item.duration)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );

  if (!currentItem) {
    return null;
  }

  return (
    <>
      <title>Play Queue</title>
      {/* Current gradient */}
      <div
        className="absolute inset-0 -z-10 h-full"
        style={{
          background: `linear-gradient(
            to top,
            ${selectedColor} 0%,
            ${selectedColor} 50%,
            transparent 100%
          )`,
        }}
      />
      {/* New gradient fades in over the old one */}
      <div
        key={selectedColor}
        className="absolute inset-0 -z-10 pointer-events-none animate-[fade-in_100ms_ease-in-out] h-full"
        style={{
          background: `linear-gradient(
            to top,
            ${selectedColor} 0%,
            ${selectedColor} 50%,
            transparent 100%
          )`,
        }}
      />
      {/* extra small resolutions */}
      {isMobile && (
        <div className="flex flex-col w-full h-full align-middle">
          <div className="flex flex-row w-full bg-background/50">
            <div className="flex flex-row">
              <Button
                aria-label="Repeat playback queue"
                variant="ghost"
                size="icon-lg"
                className={[
                  `m-${iconMargin} h-${iconSize} w-${iconSize} p-${iconPadding} hover:bg-foreground/20!`,
                  isRepeating ? 'bg-foreground/10!' : '',
                ].join(' ')}
                onClick={() => setIsRepeating((prev) => !prev)}
              >
                <Repeat className="h-8! w-8!" strokeWidth={1} />
              </Button>
              <Button
                aria-label="Shuffle playback queue"
                variant="ghost"
                size="icon-lg"
                className={[
                  `m-${iconMargin} h-${iconSize} w-${iconSize} p-${iconPadding} hover:bg-foreground/20!`,
                  isShuffling ? 'bg-foreground/10!' : '',
                ].join(' ')}
                onClick={() => setIsShuffling((prev) => !prev)}
              >
                <Shuffle className="h-8! w-8!" strokeWidth={1} />
              </Button>
            </div>
            <div className="flex flex-row grow justify-end">
              <Button
                aria-label={isShowingQueue ? 'Show current playing' : 'Show queue items'}
                variant="ghost"
                size="icon-lg"
                className={[
                  `m-${iconMargin} h-${iconSize} w-${iconSize} p-${iconPadding} hover:bg-foreground/20!`,
                  isShowingQueue ? 'bg-foreground/10!' : '',
                ].join(' ')}
                onClick={toggleQueue}
              >
                {isShowingQueue && <AlbumIconImage albumId={currentItem.albumId} size={100} className="h-8! w-8!" />}
                {!isShowingQueue && <Logs className="h-8! w-8!" strokeWidth={1} />}
              </Button>
            </div>
          </div>
          {isShowingQueue && <>{playingQueue}</>}
          {!isShowingQueue && (
            <div className="p-4 flex flex-col h-full justify-center items-center align-middle">
              <div className="relative w-full mb-4">
                <AlbumFullImage albumId={currentItem.albumId} size={600} className="w-full object-cover" />
              </div>
              <div className="p-4">
                <h1 className="mb-2 text-2xl font-bold">{currentItem.title}</h1>
                <h2 className="mb-2 text-xl font-semibold">{currentItem.albumTitle}</h2>
                <h3 className="mb-2 text-lg text-foreground/80">
                  {currentItem.albumArtists.map((artist) => artist.name).join(', ')}
                </h3>
                <span className="text-sm text-foreground/50">
                  {secondsToMinutesAndSeconds(currentTime)} / {secondsToMinutesAndSeconds(currentItem.duration)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* mobile and desktop resolutions */}
      {!isMobile && (
        <div className="flex flex-row w-full">
          <div className="relative flex flex-row w-100 h-full p-4">
            <div className="relative w-100">
              <AlbumFullImage
                albumId={currentItem.albumId}
                size={600}
                className="absolute z-0 w-100 h-100 object-cover"
              />
              <div className="absolute top-100 right-0 z-1 h-30 w-100 overflow-hidden">
                {/* Reflected image */}
                <div className="opacity-30 ">
                  <AlbumFullImage
                    albumId={currentItem.albumId}
                    size={600}
                    className="absolute z-2 w-100 h-100 scale-y-[-1]"
                  />
                  <div
                    className="absolute z-3 top-0 right-0 w-120 h-60"
                    style={{
                      background: `linear-gradient(
                      to top,
                      ${selectedColor} 0%,
                      ${selectedColor} 50%,
                      transparent 100%
                    )`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="absolute top-110 z-4">
                <h1 className="ml-2 mb-2 text-2xl font-bold">{currentItem.title}</h1>
                <h2 className="ml-2 mb-2 text-xl font-semibold">{currentItem.albumTitle}</h2>
                <h3 className="ml-2 mb-2 text-lg text-foreground/80">
                  {currentItem.albumArtists.map((artist) => artist.name).join(', ')}
                </h3>
              </div>
            </div>
          </div>
          <>{playingQueue}</>
        </div>
      )}
    </>
  );
}
