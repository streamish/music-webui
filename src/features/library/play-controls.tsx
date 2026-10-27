import { Button } from '../../components/ui/button';
import { type JSX, useEffect, useState } from 'react';
import { ListEnd, ListStart, Play } from 'lucide-react';
import { RatingControls } from './rating-controls';
import { ShoutcastStationEditForm } from './shoutcast-station-edit-form';
import { TrackEditForm } from './track-edit-form';
import { useQueueActions } from '@/features/library/queue';
import type { components } from '@/types/api-schema';

type Album = components['schemas']['LibraryAlbumDto'];
type Track = components['schemas']['LibraryTrackDto'];
type Station = components['schemas']['LibraryShoutcastStationDto'];

export function PlayControls({
  album,
  className,
  hideEditButton,
  hidePlayButton,
  hideQueueButtons,
  hideRatingButtons,
  station,
  textLabels,
  tracks,
}: {
  album?: Album;
  className?: string;
  hideQueueButtons?: boolean;
  hideEditButton?: boolean;
  hidePlayButton?: boolean;
  hideRatingButtons?: boolean;
  station?: Station;
  textLabels?: boolean;
  tracks?: Track[];
}) {
  const { addToQueue, clearQueue, playStation, togglePlay } = useQueueActions();
  const [autoPlay, setAutoPlay] = useState(false);

  const addTracksToQueue = (atStart = true) => {
    if (tracks?.length) {
      addToQueue(tracks, atStart);
    }
  };

  const playImmediately = () => {
    clearQueue();
    if (tracks?.length) {
      addToQueue(tracks, false);
      setAutoPlay(true);
    } else if (station) {
      playStation(station);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      togglePlay(true);
      setAutoPlay(false);
    }
  }, [autoPlay]);

  const [EditForm, setEditForm] = useState<JSX.Element>(<></>);

  useEffect(() => {
    if (tracks?.length) {
      setEditForm(<TrackEditForm track={tracks[0]} />);
    } else if (station) {
      setEditForm(<ShoutcastStationEditForm station={station} />);
    } else {
      setEditForm(<></>);
    }
  }, [tracks, station]);

  return (
    <menu className={`opacity-75 flex flex-row ${className || ''}`}>
      {!hidePlayButton && (
        <Button
          variant="ghost"
          className="w-fit self-start p-1 mx-1 px-2"
          aria-label="Play now"
          onClick={playImmediately}
        >
          <Play /> {textLabels ? <span>Play</span> : null}
        </Button>
      )}
      {!hideQueueButtons && (
        <>
          <Button
            variant="ghost"
            aria-label="Add to start of queue"
            className="w-fit self-start p-1 mr-1 px-2"
            onClick={() => addTracksToQueue(true)}
          >
            <ListStart className="scale-x-[-1]" /> {textLabels ? <span>Queue at front</span> : null}
          </Button>
          <Button
            variant="ghost"
            aria-label="Add to end of queue"
            className="w-fit self-start p-1 px-2"
            onClick={() => addTracksToQueue(false)}
          >
            <ListEnd /> {textLabels ? <span>Queue at end</span> : null}
          </Button>
        </>
      )}
      {!hideEditButton && EditForm}
      {!hideRatingButtons && tracks?.[0] && <RatingControls track={tracks?.[0]} album={album} />}
    </menu>
  );
}
