import { AssociationIconImage } from './association-icon-image';
import type { components } from '@/types/api-schema';

type Association = components['schemas']['LibraryAssociationDto'];

export function AssociationListItem({
  association,
  isExpanded,
  onToggle,
}: {
  association: Association;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`Browse ${association.name}`}
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
          <AssociationIconImage associationId={association.id} className="w-8 h-8 mr-2" size={100} />
          <div>
            <h3 className="text-foreground/80 py-1">{association.name}</h3>
          </div>
        </div>
      </button>
    </>
  );
}
