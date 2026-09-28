import { AlbumStandaloneDetails } from './album-standalone-details';
import { PlaybackControls } from './playback-controls';
import { useAssociation } from '@/hooks/user/use-associations';

export function ComposerStandaloneDetails({ composerId, onClose }: { composerId: number; onClose: () => void }) {
  const { association: composer } = useAssociation({ id: composerId });
  if (!composer) {
    return null;
  }
  const tracks = composer.composerCredits.flatMap((album) => album.tracks);
  return (
    <>
      <h3 className="text-foreground/80">{composer.name}</h3>
      <PlaybackControls tracks={tracks} textLabels={true} />
      {composer.composerCredits.map((album) => {
        return <AlbumStandaloneDetails key={album.id} albumId={album.id} composer={composer} onClose={onClose} />;
      })}
    </>
  );
}
