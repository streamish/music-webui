import { AlbumEditForm } from '@/features/library/album-edit-form';
import { AlbumFullImage } from './album-full-image';
import { AlbumTrackList } from './album-track-list';
import { ArrowLeftCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PlaylistControls } from './playlist-controls';
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
  const { data: album, refetch } = useAlbum(albumId);
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
      className="w-full h-full flex flex-col grow bg-muted/50 px-4 pb-20"
      style={{
        backgroundColor: selectedColor,
      }}
    >
      {/* Navigation back to albums */}
      <menu
        className="text-right"
        style={{
          color: getContrastingTextColor(contrastingColor),
          mixBlendMode: 'screen',
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
      {/* Image */}
      <AlbumFullImage albumId={album.id} size={600} className="w-full" />
      {/* Album info */}
      <div style={{ color: `${getContrastingTextColor(contrastingColor)}`, mixBlendMode: 'screen' }}>
        <h3 className="font-semibold text-2xl mb-0! pb-0!">
          {album.title} <span className="text-xs">{album.year}</span>
          <AlbumEditForm album={album} onSave={handleEdit} className="mb-0" />
        </h3>
        <PlaylistControls
          tracks={album.tracks}
          album={album}
          hidePlayButton={true}
          hideEditButton={true}
          hideQueueButtons={true}
          textLabels={true}
          className="-mx-8 mb-2"
          onEdit={() => {}}
        />
        <PlaylistControls
          tracks={album.tracks}
          textLabels={true}
          onEdit={handleEdit}
          hideRatingButtons={true}
          className="m-0!"
        />
        {trackGroups.map((trackGroup, index) => (
          <div key={index}>
            {showDiscTitle && <h4 className="uppercase font-semibold text-xs mb-2 opacity-35">Disc {index + 1}</h4>}
            <AlbumTrackList tracks={trackGroup} onEdit={handleEdit} />
          </div>
        ))}
      </div>
    </div>
  );
}
