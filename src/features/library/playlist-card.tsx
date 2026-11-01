import type { components } from '@/types/api-schema';

type Playlist = components['schemas']['PlaylistDto'];

export function PlaylistCard({
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
        role="button"
        className={[
          'w-54 lg:w-68',
          'h-68 lg:h-82',
          'p-0 m-0 border-transparent rounded-lg text-left transition-colors',
        ].join(' ')}
      >
        <div
          className={[
            'w-54 lg:w-68',
            'h-54 lg:h-68',
            'rounded-lg',
            'shadow-sm shadow-foreground/50 dark:shadow-background',
            'hover:brightness-90 transition-colors',
            isExpanded ? 'bg-muted-foreground/80 transition-colors' : '',
          ].join(' ')}
        >
          <div className="p-2">
            <h3 className="text-center text-sm text-foreground/80">{playlist.name}</h3>
            <p className="text-center text-xs text-foreground/60">{playlist.type}</p>
          </div>
        </div>
      </button>
    </>
  );
}
