import { AlbumStandaloneDetails } from './album-standalone-details';
import { useAssociation } from '@/hooks/user/use-associations';

export function ArtistStandaloneDetails({
  artistId,
  artistOnly,
  onClose,
}: {
  artistId: number;
  artistOnly?: boolean;
  onClose: () => void;
}) {
  const { association: artist } = useAssociation({ id: artistId });
  if (!artist) {
    return null;
  }
  return artist.albumArtistCredits.map((album, index) => {
    return (
      <AlbumStandaloneDetails
        key={album.id}
        albumId={album.id}
        artist={artistOnly ? artist : undefined}
        showArtistHeader={index === 0}
        onClose={onClose}
      />
    );
  });
}
