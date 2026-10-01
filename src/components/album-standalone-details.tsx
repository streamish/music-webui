import { AlbumEditForm } from '@/features/library/album-edit-form';
import { AlbumFullImage } from './album-full-image';
import { AlbumTrackList } from './album-track-list';
import { ArrowLeftCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PlaybackControls } from './playback-controls';
import { createTrackGroups } from '@/utils/tracks';
import { getContrastingTextColor } from '@/utils/color';
import { useAlbum } from '@/hooks/user/use-albums';

export function AlbumStandaloneDetails({
  albumId,
  onClose,
  onEdit,
}: {
  albumId: number;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { album, refetch } = useAlbum({ id: albumId });
  if (!album) {
    return null;
  }
  const handleEdit = () => {
    refetch();
    onEdit();
  };
  const selectedColor = album.coverImageMuted || '#000000';
  const contrastingColor = album.coverImageDarkMuted || '#000000';
  const trackGroups = createTrackGroups(album.tracks);
  const showDiscTitle = trackGroups[0][0]?.discNumber !== trackGroups[trackGroups.length - 1][0]?.discNumber;
  return (
    <div
      aria-label={`Album details:  ${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
      className="w-full flex flex-col grow bg-muted/50 pl-8 -mx-4"
      style={{
        backgroundColor: selectedColor,
      }}
    >
      <div className="flex flex-row justify-between items-center">
        <menu
          className="opacity-75 text-right"
          style={{
            color: album.coverImageLightMuted,
            mixBlendMode: 'difference',
          }}
        >
          <Button
            variant="ghost"
            onClick={onClose}
            className="inline-flex flex-row w-fit self-start m-2"
            aria-label="Back button"
          >
            <ArrowLeftCircle />
            Back
          </Button>
        </menu>
      </div>
      {/* Image */}
      <AlbumFullImage albumId={album.id} size={600} className="w-full" />
      {/* Album info */}
      <div style={{ color: `${getContrastingTextColor(contrastingColor)}`, mixBlendMode: 'screen' }}>
        <div className="p-8">
          <h3 className="font-semibold text-2xl mb-2">
            {album.title} <span className="text-xs">{album.year}</span>
            <AlbumEditForm album={album} onSave={handleEdit} />
          </h3>
          <PlaybackControls tracks={album.tracks} textLabels={true} onEdit={handleEdit} />
          {trackGroups.map((trackGroup, index) => (
            <div key={index}>
              {showDiscTitle && <h4 className="uppercase font-semibold text-xs mb-2 opacity-35">Disc {index + 1}</h4>}
              <AlbumTrackList tracks={trackGroup} onEdit={handleEdit} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
