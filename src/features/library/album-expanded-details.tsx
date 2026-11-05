import { AddToPlaylistButton } from '@/features/library/add-to-playlist-button';
import { AlbumEditForm } from '@/features/library/album-edit-form';
import { AlbumFullImage } from './album-full-image';
import { AlbumTrackList } from './album-track-list';
import { FavoriteControls } from './add-to-favorite-button';
import { PlayControls } from './play-controls';
import { createTrackGroups } from '@/utils/tracks';
import { getAlbumPalette, hexToRgb } from '@/utils/color';
import { useAlbum } from '@/features/library/api/albums';
import { useMemo, useRef } from 'react';

export function AlbumExpandedDetails({ albumId }: { albumId: number }) {
  const { data: album } = useAlbum(albumId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { background: selectedColor, foreground } = getAlbumPalette(album);
  const trackGroups = useMemo(() => createTrackGroups(album?.tracks || []), [album?.tracks]);
  const showDiscTitle = trackGroups[0]?.[0]?.discNumber !== trackGroups[trackGroups.length - 1]?.[0]?.discNumber;
  if (containerRef) {
    const element = containerRef.current;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }
  if (!album) {
    return null;
  }
  return (
    <div
      className="album-details-animate"
      aria-label={`Album details:  ${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
    >
      <div
        className="relative w-full"
        style={{
          backgroundColor: hexToRgb(selectedColor, 0.25),
        }}
      >
        <div aria-hidden="true" className="float-right invisible aspect-square w-60 md:w-80 lg:w-100 xl:w-120"></div>
        {/* Image on the right */}
        <div className="absolute z-1 top-0 right-0 w-60 md:w-80 lg:w-100 xl:w-120 overflow-hidden">
          <div className="flex flex-col h-full">
            <AlbumFullImage albumId={album.id} size={600} className="w-60 md:w-80 lg:w-100 xl:w-120 object-cover" />
            {/* Reflection */}
            <div className="opacity-30">
              <AlbumFullImage
                albumId={album.id}
                size={600}
                className="w-60 md:w-80 lg:w-100 xl:w-120 object-cover scale-y-[-1]"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
                  maskImage: 'linear-gradient(to bottom, transparent, black)',
                }}
              />
            </div>
          </div>
          <div
            className="absolute z-2 top-0 -left-10 w-20 h-full"
            style={{
              background: `linear-gradient(
                to right,
                ${selectedColor} 0%,
                ${selectedColor} 50%,
                transparent 100%
              )`,
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            }}
          ></div>
        </div>
        {/* Color overlay */}
        <div
          className="absolute z-2 w-full h-full"
          style={{
            background: `linear-gradient(
              to bottom right,
              ${selectedColor} 10%,
              ${selectedColor} 10%,
              transparent 100%
            )`,
          }}
        ></div>
        {/* Album data */}
        <div className="relative z-3">
          {/* Physical filler */}
          <div
            className="p-4 lg:pl-8 mr-60 md:mr-80 lg:mr-100 xl:mr-120 2xl:mr-140"
            style={{
              color: foreground,
            }}
            ref={containerRef}
          >
            <h3 className="mb-2 text-2xl flex flex-row items-center">
              {album.title} <span className="mx-2 text-sm opacity-50 align-middle">({album.year})</span>
              <FavoriteControls album={album} />
              <AddToPlaylistButton album={album} />
              <AlbumEditForm album={album} />
            </h3>
            <PlayControls tracks={album.tracks} album={album} textLabels={true} hideRatingButtons={true} />
            <PlayControls
              tracks={album.tracks}
              album={album}
              hidePlayButton={true}
              hideEditButton={true}
              hideQueueButtons={true}
              textLabels={true}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-x-20 gap-y-6">
              {trackGroups.map((trackGroup, index) => {
                return (
                  <div key={index} className="max-w-40% flex-1">
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
