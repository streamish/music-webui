import { PlaybackControls } from './playback-controls';
import type { TrackWithContent } from '@/features/library/library';

export function TrackListItem({ track }: { track: TrackWithContent }) {
  return (
    <div
      key={track.id}
      className={[
        'flex flex-row',
        'bg-accent rounded-lg p-2 shadow-sm shadow-foreground/50 dark:shadow-background',
        'hover:bg-muted-foreground/50 transition-colors',
      ].join(' ')}
    >
      <div>
        <h3 className="text-md font-semibold text-foreground/80">{track.title}</h3>
        <h4 className="text-foreground/80">{track.album.title}</h4>
        <p className="text-sm text-foreground/60">{track.artists.map((artist) => artist.name).join(', ')}</p>
        <PlaybackControls track={track} />
      </div>
    </div>
  );
}
