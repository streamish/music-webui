import { AddToPlaylistButton } from '@/features/library/add-to-playlist-button';
import { FavoriteControls } from './favorite-controls';
import { PlayControls } from './play-controls';
import type { components } from '@/types/api-schema';

type Track = components['schemas']['LibraryTrackDto'];

export function TrackListItem({ track, albumTitle }: { track: Track; albumTitle: string }) {
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
        <FavoriteControls track={track} />
        <AddToPlaylistButton track={track} />
        <PlayControls tracks={[track]} />
      </div>
    </div>
  );
}
