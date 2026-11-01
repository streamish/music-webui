import type { components } from '@/types/api-schema';

type Playlist = components['schemas']['PlaylistDto'];

export function PlaylistListItem({
  playlist,
  isExpanded,
  onToggle,
}: {
  playlist: Playlist;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${playlist.name} (${playlist.type})}`}
        className="w-full p-0 m-0 border-transparent rounded-lg text-left transition-colors"
      >
        <div
          className={[
            'flex flex-row',
            'bg-accent rounded-lg p-2 shadow-sm shadow-foreground/50 dark:shadow-background',
            'hover:bg-muted-foreground/50 transition-colors',
            isExpanded ? 'bg-muted-foreground/80 transition-colors' : '',
          ].join(' ')}
        >
          <h3 className="text-foreground/80">{playlist.name}</h3>
          <p className="text-sm text-foreground/60">{playlist.type}</p>
        </div>
      </button>
    </>
  );
}
