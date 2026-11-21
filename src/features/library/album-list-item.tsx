import { AlbumIconImage } from './album-icon-image';
import { PlayControls } from './play-controls';
import type { components } from '@/types/api-schema';

type Album = components['schemas']['LibraryAlbumDto'];

export function AlbumListItem({
  album,
  isExpanded,
  onToggle,
}: {
  album: Album;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      aria-label={`${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
      className="w-full p-0 m-0 rounded-lg text-left transition-colors cursor-pointer relative group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div
        className={[
          'flex flex-row',
          'bg-accent rounded-lg p-2 shadow-sm shadow-foreground/50 dark:shadow-background',
          'hover:bg-muted-foreground/50 transition-colors',
          isExpanded ? 'bg-muted-foreground/80 transition-colors' : '',
        ].join(' ')}
      >
        <AlbumIconImage
          albumId={album.id}
          aria-label={`Icon image for ${album.title}}`}
          className="w-30 h-30 mr-2"
          size={100}
        />
        <div>
          <h3 className="text-foreground/80">{album.title}</h3>
          <p className="text-sm text-foreground/60">{album.artists.map((artist) => artist.name).join(', ')}</p>
        </div>
        <div
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <PlayControls
            albumId={album.id}
            hideQueueButtons={true}
            hideEditButton={true}
            hideRatingButtons={true}
            textLabels={false}
            className="p-0"
          />
        </div>
      </div>
    </div>
  );
}
