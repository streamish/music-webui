import { AlbumExpandedDetails } from './album-expanded-details';
import { PlaybackControls } from './playback-controls';
import type { ComposerWithContents } from '@/features/library/library';

export function ComposerExpandedDetails({
  composer,
  composerOnly,
}: {
  composer: ComposerWithContents;
  composerOnly?: boolean;
}) {
  const contrastingColor = composer.albums[0].coverImageDarkMuted || '#000000';
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
        <h3 className="text-xl ml-2 text-foreground/80">{composer.name}</h3>
        {composer.albums.length > 1 && <PlaybackControls composer={composer} textLabels={true} />}
      </div>
      {composer.albums.map((album) => {
        return <AlbumExpandedDetails album={album} composer={composerOnly ? composer : undefined} />;
      })}
    </div>
  );
}
