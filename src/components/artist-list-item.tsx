import { ArtistIconImage } from './artist-icon-image';
import type { Artist } from '@/hooks/user/use-associations';

export function ArtistListItem({
  artist,
  isExpanded,
  onToggle,
}: {
  artist: Artist;
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
            'rounded-lg p-1',
            'hover:bg-muted-foreground/25 transition-colors',
            isExpanded ? 'bg-muted-foreground/20 transition-colors' : '',
          ].join(' ')}
        >
          <ArtistIconImage artistId={artist.id} aria-label={`${artist.name}`} className="w-8 h-8 mr-2" size={100} />
          <div>
            <h3 className="text-foreground/80 py-1">{artist.name}</h3>
          </div>
        </div>
      </button>
    </>
  );
}
