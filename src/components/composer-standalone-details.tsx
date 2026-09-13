import { AlbumStandaloneDetails } from './album-standalone-details';
import { PlaybackControls } from './playback-controls';
import type { ComposerWithContents } from '@/features/library/library';

export function ComposerStandaloneDetails({
  composer,
  onClose,
}: {
  composer: ComposerWithContents;
  onClose: () => void;
}) {
  return (
    <>
      <h3 className="text-foreground/80">{composer.name}</h3>
      <PlaybackControls composer={composer} textLabels={true} />
      {composer.albums.map((album) => {
        return <AlbumStandaloneDetails album={album} composer={composer} onClose={onClose} />;
      })}
    </>
  );
}
