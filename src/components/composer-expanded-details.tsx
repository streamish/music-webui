import { AlbumExpandedDetails } from './album-expanded-details';
import { ComposerEditForm } from '../features/library/composer-edit-form';
import { PlaybackControls } from './playback-controls';
import { useAssociation } from '@/hooks/user/use-associations';

export function ComposerExpandedDetails({ composerId, composerOnly }: { composerId: number; composerOnly?: boolean }) {
  const { association: composer } = useAssociation({ id: composerId });
  if (!composer) {
    return null;
  }
  const tracks = composer.albumArtistCredits.flatMap((album) => {
    if (!composerOnly) {
      return album.tracks;
    }
    return album.tracks.filter((track) => track.composers.some((artist) => artist.id === composerId));
  });
  const contrastingColor = composer.albumArtistCredits?.[0]?.coverImageDarkMuted || '#000000';
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
          <h3 className="text-xl ml-2 text-foreground/80">{composer.name}</h3>
          <ComposerEditForm composer={composer} />
        </div>
        {composer.albumArtistCredits.length > 1 && <PlaybackControls tracks={tracks} textLabels={true} />}
      </div>
      {composer.albumArtistCredits.map((album) => {
        return <AlbumExpandedDetails key={album.id} album={album} composer={composerOnly ? composer : undefined} />;
      })}
    </div>
  );
}
