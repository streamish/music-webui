import { AlbumIconImage } from './album-icon-image';
import type { components } from '@/types/api-schema';

type Album = components['schemas']['LibraryAlbumDto'];

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
        aria-label={`${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
        role="button"
        className={[
          'w-34 lg:w-48',
          'h-58 lg:h-62',
          'p-0 m-0 border-transparent rounded-lg text-left transition-colors',
        ].join(' ')}
      >
        <div
          className={[
            'w-34 lg:w-48',
            'h-34 lg:h-48',
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
              'w-34 lg:w-48',
              'h-34 lg:h-48',
              'bg-accent rounded-lg p-1',
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
            <AlbumIconImage
              albumId={album.id}
              aria-label={`Cover image for ${album.title}`}
              className="w-34 h-34 lg:w-46 lg:h-46"
              size={600}
            />
          </div>
          <div className="p-1">
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
