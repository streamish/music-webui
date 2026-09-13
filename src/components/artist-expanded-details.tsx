import { AlbumExpandedDetails } from './album-expanded-details';
import { PlaybackControls } from './playback-controls';
import type { ArtistWithContents } from '@/features/library/library';

export function ArtistExpandedDetails({ artist, artistOnly }: { artist: ArtistWithContents; artistOnly?: boolean }) {
  const contrastingColor = artist.albums[0].coverImageDarkMuted || '#000000';
  return (
    <div
      className="relative w-full min-h-120 bg-muted/50"
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
        <h3 className="text-3xl ml-2 text-foreground/80" style={{ color: contrastingColor, mixBlendMode: 'screen' }}>
          {artist.name}
        </h3>
        {artist.albums.length > 1 && <PlaybackControls artist={artist} textLabels={true} />}
      </div>
      {artist.albums.map((album, index) => {
        return (
          <AlbumExpandedDetails
            key={`album-${album.id}-${index}`}
            album={album}
            artist={artistOnly ? artist : undefined}
            autoScroll={index === 0}
          />
        );
      })}
    </div>
  );
}
