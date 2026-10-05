import { PlaylistControls } from './playlist-controls';
import type { Track } from '@/hooks/user/use-tracks';

export function TrackListItem({ track, albumTitle, onEdit }: { track: Track; albumTitle: string; onEdit: () => void }) {
  return (
    <div
      className={[
        'flex flex-row',
        'bg-accent rounded-lg p-2 shadow-sm shadow-foreground/50 dark:shadow-background',
        'hover:bg-muted-foreground/50 transition-colors',
      ].join(' ')}
    >
      <div>
        <h3 className="text-md font-semibold text-foreground/80">{track.title}</h3>
        <h4 className="text-foreground/80">{albumTitle}</h4>
        <p className="text-sm text-foreground/60">{track.artists.map((artist) => artist.name).join(', ')}</p>
        <PlaylistControls tracks={[track]} onEdit={onEdit} />
      </div>
    </div>
  );
}
