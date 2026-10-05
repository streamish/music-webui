import { Button } from './ui/button';
import { ListEnd, ListStart, Play } from 'lucide-react';
import { RatingControls } from './rating-controls';
import { TrackEditForm } from '../features/library/track-edit-form';
import { useEffect, useState } from 'react';
import { useQueueActions } from '@/features/library/queue';
import type { Album } from '@/hooks/user/use-albums';
import type { Track } from '@/hooks/user/use-tracks';

export function PlaylistControls({
  album,
  className,
  hideEditButton,
  hidePlayButton,
  hideQueueButtons,
  hideRatingButtons,
  textLabels,
  tracks,
  onEdit,
}: {
  album?: Album;
  className?: string;
  hideQueueButtons?: boolean;
  hideEditButton?: boolean;
  hidePlayButton?: boolean;
  hideRatingButtons?: boolean;
  textLabels?: boolean;
  tracks: Track[];
  onEdit: () => void;
}) {
  const { addToQueue, clearQueue, togglePlay } = useQueueActions();
  const [autoPlay, setAutoPlay] = useState(false);

  const addTracksToQueue = (atStart = true) => {
    addToQueue(tracks, atStart);
  };

  const replaceQueue = () => {
    clearQueue();
    addToQueue(tracks, false);
    setAutoPlay(true);
  };

  useEffect(() => {
    if (autoPlay) {
      togglePlay(true);
      setAutoPlay(false);
    }
  }, [autoPlay]);

  return (
    <menu className={`opacity-75 flex flex-row ${className || ''}`}>
      {!hidePlayButton && (
        <Button variant="ghost" className="w-fit self-start p-1 mx-1 px-2" aria-label="Play now" onClick={replaceQueue}>
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
      {!hideEditButton && tracks[0] && <TrackEditForm track={tracks[0]} onSave={onEdit} />}
      {!hideRatingButtons && <RatingControls track={tracks[0]} album={album} />}
    </menu>
  );
}
