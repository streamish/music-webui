import { FavoriteControls } from './favorite-controls';
import { PlayControls } from './play-controls';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

function useShoutcastOnlineStations(genreId: number) {
  return useQuery({
    queryKey: ['shoutcast-online-stations', genreId],
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-online-shoutcast-stations', {
        params: {
          query: {
            id: genreId,
          },
        },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data.stations?.length) {
        throw new Error('No stations returned');
      }
      return data.stations;
    },
  });
}

export function ShoutcastOnlineStationsTable({ genreId, onEdit }: { genreId: number; onEdit: () => void }) {
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
              <div className="flex flex-row">
                <span className="text-md">{station.title}</span>
                <PlayControls station={station} hideQueueButtons={true} hideEditButton={true} onEdit={onEdit} />
                <FavoriteControls station={station} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
