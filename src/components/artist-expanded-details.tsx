import { AlbumExpandedDetails } from './album-expanded-details';
import { AssociationEditForm } from '../features/library/association-edit-form';
import { PlaybackControls } from './playback-controls';
import { useAssociation } from '@/hooks/user/use-associations';

export function ArtistExpandedDetails({ artistId, artistOnly }: { artistId: number; artistOnly?: boolean }) {
  const { association: artist } = useAssociation({ id: artistId });
  if (!artist) {
    return null;
  }
  const tracks = artist.albumArtistCredits.flatMap((album) => {
    if (!artistOnly) {
      return album.tracks;
    }
    return album.tracks.filter((track) => track.artists.some((a) => a.id === artistId));
  });
  const contrastingColor = artist.albumArtistCredits[0].coverImageDarkMuted || '#000000';
  return (
    <div
      className="relative w-full min-h-120 bg-muted/50 animate-[details-in_300ms_ease-out]"
      style={{
        backgroundColor: contrastingColor,
      }}
    >
      <div
        className="mt-4 p-2 bg-muted/50"
        style={{
          backgroundColor: contrastingColor,
        }}
      >
        <div className="flex flex-row justify-between">
          <h3 className="text-3xl ml-2 text-foreground/80" style={{ color: contrastingColor, mixBlendMode: 'screen' }}>
            {artist.name}
          </h3>
          <AssociationEditForm artist={artist} />
        </div>
        {artist.albumArtistCredits.length > 1 && <PlaybackControls tracks={tracks} textLabels={true} />}
      </div>
      {artist.albumArtistCredits.map((album, index) => {
        return (
          <AlbumExpandedDetails
            key={album.id}
            albumId={album.id}
            albumPreloaded={album}
            artist={artistOnly ? artist : undefined}
            autoScroll={index === 0}
          />
        );
      })}
    </div>
  );
}
