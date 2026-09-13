import {
  type Album,
  type ArtistWithContents,
  type ComposerWithContents,
  type Track,
  createTrackGroups,
} from '@/features/library/library';
import { AlbumFullImage } from './album-full-image';
import { AlbumTrackList } from './album-track-list';
import { ArrowLeftCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PlaybackControls } from './playback-controls';
import { getContrastingTextColor } from '@/utils/color';

export function AlbumStandaloneDetails({
  album,
  artist,
  composer,
  showArtistHeader,
  onClose,
}: {
  album: Album;
  artist?: ArtistWithContents;
  composer?: ComposerWithContents;
  showArtistHeader?: boolean;
  onClose: () => void;
}) {
  const selectedColor = album.coverImageMuted || '#000000';
  const contrastingColor = album.coverImageDarkMuted || '#000000';
  let tracks: Track[];
  if (artist) {
    tracks = album.tracks.filter((track) => track.artists.some((a) => a.id === artist.id));
  } else if (composer) {
    tracks = album.tracks.filter((track) => track.composers.some((c) => c.id === composer.id));
  } else {
    tracks = album.tracks;
  }
  const trackGroups = createTrackGroups(tracks);
  const showDiscTitle = trackGroups[0][0]?.discNumber !== trackGroups[trackGroups.length - 1][0]?.discNumber;

  return (
    <div
      className="w-full flex flex-col grow bg-muted/50 pl-8 -mx-4"
      style={{
        backgroundColor: selectedColor,
      }}
    >
      <div className="flex flex-row justify-between items-center">
        {showArtistHeader && (
          <h3 className="text-3xl ml-2 text-foreground/80" style={{ color: selectedColor, mixBlendMode: 'screen' }}>
            {album.artists.map((item) => item.name).join(', ')}
          </h3>
        )}
        <menu className="opacity-75 w-full text-right">
          <Button variant="ghost" onClick={onClose} className="inline-flex flex-row w-fit self-start m-2">
            <ArrowLeftCircle />
            Back
          </Button>
        </menu>
      </div>
      {/* Image on the right */}
      <AlbumFullImage albumId={album.id} size={600} className="w-full" />
      {/* Album data */}
      <div style={{ color: `${getContrastingTextColor(contrastingColor)}`, mixBlendMode: 'screen' }}>
        {/* Physical filler */}
        <div className="p-8">
          <h3 className="font-semibold text-2xl mb-2">
            {album.title} <span className="text-xs">{album.year}</span>
          </h3>
          <PlaybackControls album={album} textLabels={true} />
          {trackGroups.map((trackGroup, index) => (
            <div key={index}>
              {showDiscTitle && <h4 className="uppercase font-semibold text-xs mb-2 opacity-35">Disc {index + 1}</h4>}
              <AlbumTrackList tracks={trackGroup} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
