import { AlbumStandaloneDetails } from './album-standalone-details';
import { PlaybackControls } from './playback-controls';
import { useAssociation } from '@/hooks/user/use-associations';

export function GenreStandaloneDetails({ genreId, onClose }: { genreId: number; onClose: () => void }) {
  const { association: genre } = useAssociation({ id: genreId });
  if (!genre) {
    return null;
  }
  const tracks = genre.albumArtistCredits.flatMap((album) => album.tracks);
  return (
    <>
      <h3 className="text-center text-sm text-foreground/80">{genre.name}</h3>
      <PlaybackControls tracks={tracks} textLabels={true} />
      {genre.albumArtistCredits.map((album) => {
        return <AlbumStandaloneDetails key={album.id} albumId={album.id} onClose={onClose} />;
      })}
    </>
  );
}
