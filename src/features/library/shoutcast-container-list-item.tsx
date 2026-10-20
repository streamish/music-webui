import type { LucideIcon } from 'lucide-react';

type ContainerType = 'stations' | 'favorites' | 'genres';

export function ShoutcastContainerListItem({
  name,
  icon: Icon,
  type,
  isExpanded,
  onToggle,
}: {
  name: string;
  icon: LucideIcon;
  type: ContainerType;
  isExpanded: boolean;
  onToggle: (type: ContainerType) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(type)}
      aria-expanded={isExpanded}
      aria-label={`Browse ${name}`}
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
        <Icon className="w-8 h-8 mr-2" />
        <div>
          <h3 className="text-foreground/80 py-1">{name}</h3>
        </div>
      </div>
    </button>
  );
}
