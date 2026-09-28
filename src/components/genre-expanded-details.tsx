import { AlbumExpandedDetails } from './album-expanded-details';
import { GenreEditForm } from '../features/library/genre-edit-form';
import { PlaybackControls } from './playback-controls';
import { useAssociation } from '@/hooks/user/use-associations';

export function GenreExpandedDetails({ genreId }: { genreId: number }) {
  const { association: genre } = useAssociation({ id: genreId });
  if (!genre) {
    return null;
  }
  const tracks = genre.albumArtistCredits.flatMap((album) => album.tracks);
  const contrastingColor = genre.albumArtistCredits[0].coverImageVibrant || '#000000';
  return (
    <div
      className="relative w-full min-h-120 animate-[details-in_300ms_ease-out]"
      style={{
        backgroundColor: contrastingColor,
      }}
    >
      <div
        className="p-2 bg-muted/50"
        style={{
          backgroundColor: contrastingColor,
        }}
      >
        <div className="flex flex-row justify-between">
          <h3 className="text-xl ml-2 text-foreground/80">{genre.name}</h3>
          <GenreEditForm genre={genre} />
        </div>
        {genre.albumArtistCredits.length > 1 && <PlaybackControls tracks={tracks} textLabels={true} />}
      </div>
      {genre.albumArtistCredits.map((album, index) => {
        const firstInstanceOfArtist =
          index ===
          genre.albumArtistCredits.findIndex(
            (item) =>
              item.artists.map((artist) => artist.name).join(',') ===
              genre.albumArtistCredits[index].artists.map((artist) => artist.name).join(','),
          );
        return (
          <AlbumExpandedDetails
            albumId={album.id}
            key={`album${album.id}-${index}`}
            showArtistHeader={firstInstanceOfArtist}
          />
        );
      })}
    </div>
  );
}
