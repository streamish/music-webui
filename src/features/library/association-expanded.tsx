import { AddToPlaylistButton } from '@/features/library/add-to-playlist-button';
import { AssociationEditForm } from '@/features/library/association-edit-form';
import { FavoriteControls } from './add-to-favorite-button';
import type { AssociationTypeEnum, components } from '@/types/api-schema';

type Association = components['schemas']['AssociationWithCreditsDto'];

export function AssociationExpanded({
  association,
  associationType,
  className,
}: {
  association: Association;
  associationType: AssociationTypeEnum;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="w-full flex flex-row px-4 md:px-0 lg:px-0">
        <h2 className="text-lg font-semibold">{association?.name || 'Loading...'}</h2>
        {association && (
          <>
            <FavoriteControls association={association} />
            <AddToPlaylistButton association={association} />
            <AssociationEditForm association={association} associationType={associationType} />
          </>
        )}
      </div>
    </div>
  );
}
