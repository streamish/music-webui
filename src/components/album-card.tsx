import { AlbumIconImage } from './album-icon-image';
import type { Album } from '@/hooks/user/use-albums';

export function AlbumCard({
  album,
  isExpanded,
  onToggle,
}: {
  album: Album;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const selectedColor = album.coverImageMuted || '#000000';
  const contrastingColor = album.coverImageDarkMuted || '#000000';
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
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
          style={{
            backgroundColor: contrastingColor,
          }}
        >
          <div
            className={[
              'w-54 lg:w-68',
              'h-54 lg:h-68',
              'bg-accent rounded-lg p-2 shadow-sm shadow-foreground/50 dark:shadow-background',
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
            <AlbumIconImage
              albumId={album.id}
              aria-label={`${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
              className="w-50 h-50 lg:w-64 lg:h-64"
              size={600}
            />
          </div>
          <div className="p-2">
            <h3 className="text-center text-sm text-foreground/80">{album.title}</h3>
            <p className="text-center text-xs text-foreground/60">
              {album.artists.map((artist) => artist.name).join(', ')}
            </p>
          </div>
        </div>
      </button>
    </>
  );
}
