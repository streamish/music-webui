import { AssociationTypeEnum, type components } from '@/types/api-schema';
import { Button } from '../../components/ui/button';
import { type JSX } from 'react';

type Association = components['schemas']['AssociationWithCreditsDto'];
type ViewingGroup = 'album-artists' | 'track-artists' | 'track-composers' | 'track-genres';

export function AssociationTabButtons({
  associationType,
  expandedAssociation,
  isAlbumArtists,
  className,
  viewingGroup,
  setViewingGroup,
}: {
  associationType: AssociationTypeEnum;
  expandedAssociation: Association | undefined;
  isAlbumArtists: boolean;
  className?: string;
  viewingGroup: ViewingGroup;
  setViewingGroup: (viewingGroup: ViewingGroup) => void;
}) {
  const composerCredits =
    expandedAssociation?.composerCredits.reduce((acc, curr) => acc + (curr?.tracks.length ?? 0), 0) ?? 0;
  const composer =
    composerCredits > 0 ? (
      <Button
        value="composer"
        className={[
          `px-4 hover:bg-muted/50`,
          viewingGroup === 'track-composers' ? 'bg-background/90! border-transparent' : '',
        ].join(' ')}
        variant={viewingGroup === 'track-composers' ? 'outline' : 'ghost'}
        onClick={() => setViewingGroup('track-composers')}
      >
        Composer credits ({composerCredits})
      </Button>
    ) : (
      <></>
    );
  const trackCredits =
    expandedAssociation?.artistCredits.reduce((acc, curr) => acc + (curr?.tracks.length ?? 0), 0) ?? 0;
  const track =
    trackCredits > 0 ? (
      <Button
        value="track"
        className={[
          `px-4 hover:bg-muted/50`,
          viewingGroup === 'track-artists' ? 'bg-background/90! border-transparent' : '',
        ].join(' ')}
        variant={viewingGroup === 'track-artists' ? 'outline' : 'ghost'}
        onClick={() => setViewingGroup('track-artists')}
      >
        Track credits ({trackCredits})
      </Button>
    ) : (
      <></>
    );
  const albumCredits = expandedAssociation?.albumArtistCredits.length ?? 0;
  const album =
    albumCredits > 0 ? (
      <Button
        value="album"
        className={[
          `px-4 hover:bg-muted/50`,
          viewingGroup === 'album-artists' ? 'bg-background/90! border-transparent' : '',
        ].join(' ')}
        variant={viewingGroup === 'album-artists' ? 'outline' : 'ghost'}
        onClick={() => setViewingGroup('album-artists')}
      >
        Album credits ({albumCredits})
      </Button>
    ) : (
      <></>
    );
  let items: JSX.Element[];
  switch (associationType) {
    case AssociationTypeEnum.artist:
      items = isAlbumArtists ? [album, track, composer] : [album, track, composer];
      break;
    case AssociationTypeEnum.composer:
      items = [composer, track, album];
      break;
    default:
      items = [];
  }
  return (
    <menu className={className}>
      {items.map((item, index) => (
        <li key={index} className="inline-block">
          {item}
        </li>
      ))}
    </menu>
  );
}
