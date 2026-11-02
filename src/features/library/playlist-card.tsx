import { PlaylistCoverImage } from './playlist-cover-image';
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
  const selectedColor = playlist.coverImageMuted || '#000000';
  const contrastingColor = playlist.coverImageDarkMuted || '#000000';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label={`${playlist.name} (${playlist.type})`}
      role="button"
      className={[
        'w-54 lg:w-68',
        'h-54 lg:h-68',
        'p-0 m-0 border-transparent rounded-lg text-left transition-colors',
      ].join(' ')}
      style={{
        backgroundColor: contrastingColor,
      }}
    >
      <div
        className={[
          'w-54 lg:w-68',
          'h-54 lg:h-68',
          'relative overflow-hidden rounded-lg p-1',
          'shadow-sm shadow-foreground/50 dark:shadow-background',
          'hover:brightness-90 transition-colors',
          isExpanded ? 'bg-muted-foreground/80 transition-colors' : '',
        ].join(' ')}
        style={{
          background: `linear-gradient(
                    to top,
                    ${selectedColor} 0%,
                    ${selectedColor} 50%,
                    transparent 100%
                  )`,
        }}
      >
        <PlaylistCoverImage
          playlistId={playlist.id}
          playlistName={playlist.name}
          size={600}
          className="w-54 h-54 lg:w-66 lg:h-66"
        />
        <div className="absolute inset-x-0 bottom-0 bg-background/80 p-2 text-center">
          <h3 className="text-sm text-foreground/80">{playlist.name}</h3>
          <p className="text-xs text-foreground/60">{playlist.type}</p>
        </div>
      </div>
    </button>
  );
}
