import { FavoriteControls } from './add-to-favorite-button';
import { PlayControls } from './play-controls';
import { useShoutcastOnlineStations } from './api/shoutcast';

export function ShoutcastOnlineStationsTable({ genreId }: { genreId: number }) {
  const { data: stations = [] } = useShoutcastOnlineStations(genreId);
  return (
    <table className="w-full border-collapse">
      <tbody>
        {stations.map((station, index) => (
          <tr
            key={station.url}
            className={[`py-1 ${index % 2 === 0 ? 'bg-foreground/5' : ''}`, `hover:bg-foreground/10`].join(' ')}
            aria-label={`Track item ${index + 1}`}
          >
            <td className="px-2 py-1 text-left">
              <div className="flex flex-row items-center">
                <PlayControls station={station} hideQueueButtons={true} hideEditButton={true} />
                <span className="text-md">{station.title}</span>
                <FavoriteControls station={station} className="mb-0" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
