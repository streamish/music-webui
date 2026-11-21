import { AlbumIconImage } from './album-icon-image';
import { PlayControls } from './play-controls';
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
    <div
      onClick={onToggle}
      aria-label={`${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
      role="button"
      tabIndex={0}
      className={[
        'w-34 lg:w-48',
        'h-58 lg:h-62',
        'p-0 m-0 rounded-lg text-left transition-colors cursor-pointer relative group',
      ].join(' ')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
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
            'relative',
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
          <div
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <PlayControls
              albumId={album.id}
              hideQueueButtons={true}
              hideEditButton={true}
              hideRatingButtons={true}
              quickPlay={true}
              textLabels={false}
              className="p-0"
            />
          </div>
        </div>
        <div className="p-1">
          <h3 className="text-center text-sm text-foreground/80">{album.title}</h3>
          <p className="text-center text-xs text-foreground/60">
            {album.artists.map((artist) => artist.name).join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
