import { FavoriteControls } from './favorite-controls';
import { PlayControls } from './play-controls';
import type { components } from '@/types/api-schema';

type Station = components['schemas']['LibraryShoutcastStationDto'];

export function ShoutcastStationsTable({ stations, onEdit }: { stations: Station[]; onEdit: () => void }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {stations.map((station, index) => (
          <tr
            key={station.id || station.url}
            className={[`py-1 ${index % 2 === 0 ? 'bg-foreground/5' : ''}`, `hover:bg-foreground/10`].join(' ')}
            aria-label={`Track item ${index + 1}`}
          >
            <td className="px-2 py-1 text-left flex flex-row">
              <span className="text-md">{station.title}</span>
              <PlayControls station={station} hideQueueButtons={true} onEdit={onEdit} />
              <FavoriteControls station={station} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
