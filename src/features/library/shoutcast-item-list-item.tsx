import { PlayControls } from './play-controls';
import type { LucideIcon } from 'lucide-react';

export function ShoutcastItemListItem({
  text,
  icon: Icon,
  allowEdit,
  onEdit,
}: {
  text: string;
  icon: LucideIcon;
  allowEdit: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="w-full p-0 m-0 border-transparent rounded-lg text-left transition-colors">
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
          aria-label={`Icon for ${text}`}
        />
        <div className="flex flex-col justify-between">
          <h3 className="text-sm text-foreground/80">{text}</h3>
          <div className="text-right">
            <PlayControls
              onEdit={onEdit}
              hideEditButton={!allowEdit}
              hideQueueButtons={true}
              hideRatingButtons={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
