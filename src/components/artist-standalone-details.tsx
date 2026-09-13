import { AlbumStandaloneDetails } from './album-standalone-details';
import type { ArtistWithContents } from '@/features/library/library';

export function AlbumArtistStandaloneDetails({
  artist,
  artistOnly,
  onClose,
}: {
  artist: ArtistWithContents;
  artistOnly?: boolean;
  onClose: () => void;
}) {
  return artist.albums.map((album, index) => {
    return (
      <>
        <AlbumStandaloneDetails
          album={album}
          artist={artistOnly ? artist : undefined}
          showArtistHeader={index === 0}
          onClose={onClose}
        />
      </>
    );
  });
}
