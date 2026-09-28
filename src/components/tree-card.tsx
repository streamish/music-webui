import { Folder } from 'lucide-react';
import type { TreeItemDto } from '@/hooks/user/use-folders';

export function TreeCard({ item, onToggle }: { item: TreeItemDto; onToggle: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={[
          'w-30 lg:w-38',
          'h-44 lg:h-48',
          'p-0 m-0 border-transparent rounded-lg text-left transition-colors',
        ].join(' ')}
      >
        <div
          className={[
            'w-30 lg:w-38',
            'h-44 lg:h-48',
            'rounded-lg',
            'bg-accent/25',
            'shadow-sm shadow-foreground/50 dark:shadow-background',
            'hover:brightness-90 transition-colors',
          ].join(' ')}
        >
          <div className={['w-30 lg:w-30', 'h-30 lg:h-30', 'rounded-lg p-4'].join(' ')}>
            <Folder
              strokeWidth={0.5}
              absoluteStrokeWidth={true}
              opacity={0.75}
              className="w-22 h-22 lg:w-30 lg:h-30"
              aria-label={`${item.fullPath}`}
            />
          </div>
          <div className="p-2">
            <h3 className="text-center text-sm text-foreground/80">{item.folder || item.file}</h3>
          </div>
        </div>
      </button>
    </>
  );
}
