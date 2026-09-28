import { AlbumIconImage } from './album-icon-image';
import type { Album } from '@/hooks/user/use-albums';

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
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
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
          <AlbumIconImage
            albumId={album.id}
            aria-label={`${album.title} by ${album.artists.map((artist) => artist.name).join(', ')}`}
            className="w-30 h-30 mr-2"
            size={100}
          />
          <div>
            <h3 className="text-foreground/80">{album.title}</h3>
            <p className="text-sm text-foreground/60">{album.artists.map((artist) => artist.name).join(', ')}</p>
          </div>
        </div>
      </button>
    </>
  );
}
