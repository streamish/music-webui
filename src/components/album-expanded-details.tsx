import { AlbumFullImage } from './album-full-image';
import { AlbumTrackList } from './album-track-list';
import { PlaybackControls } from './playback-controls';
import { createTrackGroups } from '@/utils/tracks';
import { useAlbum } from '@/hooks/user/use-albums';
import { useMemo, useRef } from 'react';
import type { AlbumWithTracks } from '@/hooks/user/use-albums';

export function AlbumExpandedDetails({
  albumId,
  albumPreloaded,
  autoScroll,
}: {
  albumId: number;
  albumPreloaded?: AlbumWithTracks;
  autoScroll?: boolean;
}) {
  let album: AlbumWithTracks | null;
  if (albumPreloaded) {
    album = albumPreloaded;
  } else {
    const albumLoader = useAlbum({ id: albumId });
    album = albumLoader.album;
  }
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedColor = album?.coverImageMuted || '#000000';
  const contrastingColor = album?.coverImageDarkMuted || '#000000';
  const trackGroups = useMemo(() => createTrackGroups(album?.tracks || []), [album?.tracks]);
  const showDiscTitle = trackGroups[0]?.[0]?.discNumber !== trackGroups[trackGroups.length - 1]?.[0]?.discNumber;

  if (autoScroll && containerRef) {
    const element = containerRef.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
      if (!isVisible) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }
  if (!album) {
    return null;
  }
  return (
    <div>
      <div
        className="relative w-full min-h-120"
        style={{
          backgroundColor: selectedColor,
        }}
      >
        {/* Image on the right */}
        <div className="absolute z-1 top-0 right-0 w-120 h-full overflow-hidden">
          <AlbumFullImage albumId={album.id} size={600} className="absolute z-0 w-120 h-120 object-cover" />
          <div className="absolute top-120 right-0 z-1 h-30 w-120 overflow-hidden">
            {/* Reflected image */}
            <div className="opacity-30">
              <AlbumFullImage albumId={album.id} size={600} className="absolute z-2 w-120 h-120 scale-y-[-1]" />
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
          <div
            className="absolute z-2 top-0 -left-10 w-20 h-150"
            style={{
              background: `linear-gradient(
                to right,
                ${selectedColor} 0%,
                ${selectedColor} 50%,
                transparent 100%
              )`,
            }}
          ></div>
        </div>
        {/* Color overlay */}
        <div
          className="absolute z-2 w-full h-full"
          style={{
            background: `linear-gradient(
              to bottom right,
              ${contrastingColor} 10%,
              ${contrastingColor} 10%,
              transparent 100%
            )`,
          }}
        ></div>
        {/* Album data */}
        <div className="relative z-3">
          {/* Physical filler */}
          <div className="p-4 lg:pl-8 mr-120 2xl:mr-140">
            <h3 className="font-semibold text-foreground/50 text-2xl">
              {album.title} <span className="text-sm opacity-50 align-middle">({album.year})</span>
            </h3>
            <PlaybackControls tracks={album.tracks} textLabels={true} className="mb-2 text-foreground/50" />
            <div className="lg:grid lg:grid-rows-2 2xl:grid-rows-none 2xl:grid-cols-2 gap-0 2xl:gap-20">
              {trackGroups.map((trackGroup, index) => {
                return (
                  <div key={index}>
                    {showDiscTitle && (
                      <h4 className="uppercase font-semibold text-xs mb-2 opacity-35">Disc {index + 1}</h4>
                    )}
                    <AlbumTrackList key={index} tracks={trackGroup} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
