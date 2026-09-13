import { AlbumIconImage } from '@/components/album-icon-image';
import { getContrastingTextColor } from '@/utils/color';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import { useQueue } from './queue';

export default function QueueTable() {
  const { queue, currentIndex, isPlaying, togglePlay, seek, setCurrentIndex } = useQueue();
  const track = queue[currentIndex];
  const album = track?.album;
  const selectedColor = album?.coverImageMuted || '#000000';
  const contrastingColor = album?.coverImageDarkMuted || '#000000';

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

  return (
    <>
      <title>Play Queue</title>
      <div
        className="flex flex-row p-4 h-full"
        style={{
          background: `linear-gradient(
                  to top,
                  ${selectedColor} 0%,
                  ${selectedColor} 50%,
                  transparent 100%
                )`,
        }}
      >
        <div className="flex flex-col">
          <AlbumIconImage albumId={album?.id} size={600} className="w-100 h-100 mb-4" />
          <h1 className="ml-2 mb-2 text-xl font-bold">{track?.title}</h1>
          <h2 className="ml-2 mb-2 text-md font-semibold">{album?.title}</h2>
          <h3 className="ml-2 mb-2 text-md text-foreground/80">
            {album?.artists.map((artist) => artist.name).join(', ')}
          </h3>
        </div>
        <ul className="flex grow flex-col ml-4 h-full overflow-y-scroll">
          {queue.map((item, index) => (
            <li
              className={[
                `w-full p-2 border-b last-of-type:border-0 bg-foreground/1 cursor-pointer`,
                index === currentIndex ? 'bg-foreground/10' : '',
              ].join(' ')}
              key={`queue-track-${item.id}`}
              onClick={() => selectItem(index)}
              onDoubleClick={() => selectItem(index, true)}
            >
              <div
                className="grid grid-cols-3 items-center w-full"
                style={{ color: `${getContrastingTextColor(contrastingColor)}`, mixBlendMode: 'screen' }}
              >
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <span className="block text-md text-foreground/80">{item.album.title}</span>
                </div>
                <span className="block mb-2 text-sm text-foreground/60">
                  {item.album.artists.map((artist) => artist.name).join(', ')}
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
