import { GenreIconImage } from './genre-icon-image';
import type { Association } from '@/hooks/user/use-associations';

export function GenreListItem({
  genre,
  isExpanded,
  onToggle,
}: {
  genre: Association;
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
          <GenreIconImage genreId={genre.id} aria-label={`${genre.name}`} className="w-30 h-30 mr-2" size={100} />
          <div>
            <h3 className="text-foreground/80">{genre.name}</h3>
          </div>
        </div>
      </button>
    </>
  );
}
