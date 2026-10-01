import { AlbumFullImage } from '@/components/album-full-image';
import { Button } from '@/components/ui/button';
import { Repeat, Shuffle } from 'lucide-react';
import { getContrastingTextColor } from '@/utils/color';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import { useEffect, useState } from 'react';
import { useQueueActions, useQueueData, useQueuePlayback } from './queue';

export default function QueueTable() {
  const { queue, currentIndex } = useQueueData();
  const { isPlaying } = useQueuePlayback();
  const { togglePlay, seek, setCurrentIndex } = useQueueActions();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [contrastingColor, setContrastingColor] = useState('#000000');
  const { isRepeating, isShuffling } = useQueuePlayback();
  const { setIsRepeating, setIsShuffling } = useQueueActions();
  const track = queue[currentIndex];
  const isExtraSmall = window.innerWidth < 390;
  const iconSize = isExtraSmall ? 12 : 16;
  const iconPadding = isExtraSmall ? 1 : 2;
  const iconMargin = isExtraSmall ? 1 : 2;

  useEffect(() => {
    setSelectedColor(track?.albumCoverImageMuted || '#000000');
    setContrastingColor(track?.albumCoverImageDarkMuted || '#000000');
  }, [track]);

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

  if (!track) {
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
      {!isExtraSmall && (
        <div key={`${track?.id}-${currentIndex}`} className="relative flex flex-row h-full p-4">
          <AlbumFullImage albumId={track.albumId} size={600} className="absolute z-0 w-100 h-100 object-cover" />
          <div className="absolute top-100 right-0 z-1 h-30 w-100 overflow-hidden">
            {/* Reflected image */}
            <div className="opacity-30">
              <AlbumFullImage albumId={track.albumId} size={600} className="absolute z-2 w-100 h-100 scale-y-[-1]" />
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
          <div className="absolute top-120">
            <h1 className="ml-2 mb-2 text-xl font-bold">{track?.title}</h1>
            <h2 className="ml-2 mb-2 text-md font-semibold">{track?.albumTitle}</h2>
            <h3 className="ml-2 mb-2 text-md text-foreground/80">
              {track?.albumArtists.map((artist) => artist.name).join(', ')}
            </h3>
          </div>
        </div>
      )}
      <div className="relative flex flex-col">
        {/* Controls for extra-small screens */}
        {isExtraSmall && (
          <div className="flex flex-row w-full">
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
        )}
        <ul className="flex grow flex-col h-full overflow-y-scroll">
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
                className="grid grid-cols-3 items-center w-full"
                style={{
                  color: `${getContrastingTextColor(contrastingColor)}`,
                  mixBlendMode: 'screen',
                  transition: 'color 700ms ease-in-out',
                }}
              >
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <span className="block text-md text-foreground/80">{item.albumTitle}</span>
                </div>
                <span className="block mb-2 text-sm text-foreground/60">
                  {item.albumArtists.map((artist) => artist.name).join(', ')}
                </span>
                <span className="text-right pr-4 text-sm text-foreground/80 align-middle">
                  {secondsToMinutesAndSeconds(item.duration)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
