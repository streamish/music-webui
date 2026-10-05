import { AlbumEditForm } from '@/features/library/album-edit-form';
import { AlbumFullImage } from './album-full-image';
import { AlbumTrackList } from './album-track-list';
import { PlaylistControls } from './playlist-controls';
import { createTrackGroups } from '@/utils/tracks';
import { useAlbum } from '@/hooks/user/use-albums';
import { useMemo, useRef } from 'react';

export function AlbumExpandedDetails({ albumId, onEdit }: { albumId: number; onEdit: () => void }) {
  const { album, refetch } = useAlbum({ id: albumId });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedColor = album?.coverImageMuted || '#000000';
  const contrastingColor = album?.coverImageDarkMuted || '#000000';
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
  const handleEdit = () => {
    refetch();
    onEdit();
  };
  if (!album) {
    return null;
  }
  return (
    <div aria-label={`Album details:  ${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}>
      <div
        className="relative w-full min-h-120"
        style={{
          backgroundColor: selectedColor,
        }}
      >
        {/* Image on the right */}
        <div className="absolute z-1 top-0 right-0 w-60 md:w-80 lg:w-100 xl:w-120 h-full overflow-hidden">
          <AlbumFullImage
            albumId={album.id}
            size={600}
            className="absolute z-0 w-60 md:w-80 lg:w-100 xl:w-120 object-cover"
          />
          <div
            className={[
              'absolute top-60 md:top-80 lg:top-100 xl:top-120 right-0 z-1 h-30',
              'w-60 md:w-80 lg:w-100 xl:w-120 overflow-hidden',
            ].join(' ')}
          >
            {/* Reflected image */}
            <div className="opacity-30">
              <AlbumFullImage
                albumId={album.id}
                size={600}
                className="absolute z-2 w-60 md:w-80 lg:w-100 xl:w-120 scale-y-[-1]"
              />
              <div
                className="absolute z-3 top-0 right-0 w-60 md:w-80 lg:w-100 xl:w-120 h-60"
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
          <div
            className="p-4 lg:pl-8 mr-60 md:mr-80 lg:mr-100 xl:mr-120 2xl:mr-140"
            style={{
              color: album.coverImageLightMuted,
              mixBlendMode: 'difference',
            }}
            ref={containerRef}
          >
            <h3 className="font-semibold text-2xl">
              {album.title} <span className="text-sm opacity-50 align-middle">({album.year})</span>
              <AlbumEditForm album={album} onSave={handleEdit} />
            </h3>
            <PlaylistControls
              tracks={album.tracks}
              album={album}
              textLabels={true}
              hideRatingButtons={true}
              onEdit={handleEdit}
            />
            <PlaylistControls
              tracks={album.tracks}
              album={album}
              hidePlayButton={true}
              hideEditButton={true}
              hideQueueButtons={true}
              textLabels={true}
              className="mb-2"
              onEdit={() => {}}
            />
            <div className="lg:grid lg:grid-rows-2 2xl:grid-rows-none 2xl:grid-cols-2 gap-0 2xl:gap-20">
              {trackGroups.map((trackGroup, index) => {
                return (
                  <div key={index}>
                    {showDiscTitle && (
                      <h4 className="uppercase font-semibold text-xs mb-2 opacity-35">Disc {index + 1}</h4>
                    )}
                    <AlbumTrackList key={index} tracks={trackGroup} onEdit={handleEdit} />
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
