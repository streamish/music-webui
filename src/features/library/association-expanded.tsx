import { ArrowLeftCircle } from 'lucide-react';
import { AssociationEditForm } from '@/features/library/association-edit-form';
import { Button } from '../../components/ui/button';
import { useIsMobile } from '@/hooks/use-is-mobile';
import type { AssociationTypeEnum, components } from '@/types/api-schema';

type Association = components['schemas']['AssociationWithCreditsDto'];

export function AssociationExpanded({
  association,
  associationType,
  onBack,
  className,
}: {
  association: Association;
  associationType: AssociationTypeEnum;
  onBack: () => void;
  className?: string;
}) {
  const { isMobile } = useIsMobile();
  return (
    <div className={className}>
      <div className="w-full flex flex-row px-4 md:px-0 lg:px-0">
        <h2 className="text-lg font-semibold">{association?.name || 'Loading...'}</h2>
        {association && (
          <AssociationEditForm association={association} associationType={associationType} onSave={() => {}} />
        )}
      </div>
      {isMobile && (
        <menu className="opacity-75 w-full text-right">
          <Button
            variant="ghost"
            onClick={onBack}
            className="inline-flex flex-row w-fit self-start m-2"
            aria-label="Back button"
          >
            <ArrowLeftCircle />
            Back
          </Button>
        </menu>
      )}
    </div>
  );
}
