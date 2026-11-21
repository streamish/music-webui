import { Button } from '../../components/ui/button';
import { type JSX, useEffect, useState } from 'react';
import { ListEnd, ListStart, Play } from 'lucide-react';
import { RatingControls } from './rating-controls';
import { ShoutcastStationEditForm } from './shoutcast-station-edit-form';
import { TrackEditForm } from './track-edit-form';
import { useAlbum } from '@/features/library/api/albums';
import { useQueueActions } from '@/features/library/queue';
import type { components } from '@/types/api-schema';

type Album = components['schemas']['LibraryAlbumWithTracksDto'];
type Track = components['schemas']['LibraryTrackDto'];
type Station = components['schemas']['LibraryShoutcastStationDto'];

export function PlayControls({
  album,
  albumId,
  className,
  hideEditButton,
  hidePlayButton,
  hideQueueButtons,
  hideRatingButtons,
  station,
  quickPlay,
  textLabels,
  tracks,
}: {
  album?: Album;
  albumId?: number;
  className?: string;
  hideQueueButtons?: boolean;
  hideEditButton?: boolean;
  hidePlayButton?: boolean;
  hideRatingButtons?: boolean;
  quickPlay?: boolean;
  station?: Station;
  textLabels?: boolean;
  tracks?: Track[];
}) {
  const { addToQueue, clearQueue, playStation, togglePlay } = useQueueActions();
  const { data: loadedAlbum, isLoading: isLoadingAlbum } = useAlbum(albumId || -1, Boolean(albumId) && !tracks);

  const albumToUse = album || loadedAlbum;
  const tracksToUse = tracks || album?.tracks || albumToUse?.tracks;

  const addTracksToQueue = (atStart = true) => {
    if (tracksToUse?.length) {
      addToQueue(tracksToUse, atStart);
    }
  };

  const playImmediately = async () => {
    clearQueue();
    if (tracksToUse?.length) {
      addToQueue(tracksToUse, true);
      togglePlay(true);
    } else if (station) {
      playStation(station);
    }
  };

  const [EditForm, setEditForm] = useState<JSX.Element>(<></>);

  useEffect(() => {
    if (tracksToUse?.length) {
      setEditForm(<TrackEditForm track={tracksToUse[0]} />);
    } else if (station) {
      setEditForm(<ShoutcastStationEditForm station={station} />);
    } else {
      setEditForm(<></>);
    }
  }, [tracksToUse, station]);

  return (
    <menu className={`opacity-75 flex flex-row ${className || ''}`}>
      {!hidePlayButton && (
        <Button
          variant="ghost"
          className="w-fit self-start p-1 mx-1 px-2 font-normal"
          aria-label={quickPlay ? 'Quick play' : 'Play now'}
          onClick={playImmediately}
          disabled={isLoadingAlbum}
        >
          <Play /> {textLabels ? <span>Play</span> : null}
        </Button>
      )}
      {!hideQueueButtons && (
        <>
          <Button
            variant="ghost"
            aria-label="Add to start of queue"
            className="w-fit self-start p-1 mr-1 px-2 font-normal"
            onClick={() => addTracksToQueue(true)}
            disabled={isLoadingAlbum}
          >
            <ListStart className="scale-x-[-1]" /> {textLabels ? <span>Queue at front</span> : null}
          </Button>
          <Button
            variant="ghost"
            aria-label="Add to end of queue"
            className="w-fit self-start p-1 px-2 font-normal"
            onClick={() => addTracksToQueue(false)}
            disabled={isLoadingAlbum}
          >
            <ListEnd /> {textLabels ? <span>Queue at end</span> : null}
          </Button>
        </>
      )}
      {!hideEditButton && EditForm}
      {!hideRatingButtons && tracksToUse?.[0] && <RatingControls track={tracksToUse?.[0]} album={albumToUse} />}
    </menu>
  );
}
