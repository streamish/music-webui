import { Folder as FolderIcon, Music } from 'lucide-react';
import { PlaylistControls } from './playlist-controls';
import type { components } from '@/types/api-schema';

type Folder = components['schemas']['LibraryFolderDto'];

export function TreeListItem({ item, onToggle, onEdit }: { item: Folder; onToggle?: () => void; onEdit: () => void }) {
  const Icon = item.folder ? FolderIcon : Music;

  return (
    <div onClick={onToggle} className="w-full p-0 m-0 border-transparent rounded-lg text-left transition-colors">
      <div
        className={[
          'flex flex-row',
          'bg-accent rounded-lg p-2 shadow-sm shadow-foreground/50 dark:shadow-background',
          'hover:bg-muted-foreground/50 transition-colors',
        ].join(' ')}
      >
        <Icon
          strokeWidth={0.5}
          absoluteStrokeWidth={true}
          opacity={0.75}
          className="w-22 h-22 lg:w-30 lg:h-30 mr-4"
          aria-label={`File path: ${item.fullPath}`}
        />
        <div className="flex flex-col justify-between">
          <h3 className="text-sm text-foreground/80">{item.folder || item.file}</h3>
          <div className="text-right">{item.track && <PlaylistControls tracks={[item.track]} onEdit={onEdit} />}</div>
        </div>
      </div>
    </div>
  );
}
