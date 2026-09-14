import { Button } from './ui/button';
import { ListEnd, ListStart, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLibrary } from '@/features/library/library';
import { useQueueActions } from '@/features/library/queue';
import type {
  Album,
  ArtistWithContents,
  ComposerWithContents,
  GenreWithContents,
  Track,
  TrackWithContent,
  TreeItemDto,
} from '@/features/library/library';

export function PlaybackControls({
  album,
  artist,
  composer,
  file,
  genre,
  textLabels,
  track,
  className,
}: {
  album?: Album;
  artist?: ArtistWithContents;
  composer?: ComposerWithContents;
  file?: TreeItemDto;
  genre?: GenreWithContents;
  textLabels?: boolean;
  track?: Track;
  className?: string;
}) {
  const { addToQueue, togglePlay } = useQueueActions();
  const { albums, tracks } = useLibrary();
  const [autoPlay, setAutoPlay] = useState(false);

  const items = useMemo(() => {
    if (album) {
      return album.tracks as TrackWithContent[];
    }
    if (track) {
      return [track] as TrackWithContent[];
    }
    if (artist) {
      return artist.albums.flatMap((item) => item.tracks) as TrackWithContent[];
    }
    if (composer) {
      return composer.albums.flatMap((item) => item.tracks) as TrackWithContent[];
    }
    if (genre) {
      return genre.albums.flatMap((item) => item.tracks) as TrackWithContent[];
    }
    if (file) {
      return tracks.filter((t: TrackWithContent) => t.id === file.id) as TrackWithContent[];
    }
    return [];
  }, [album, artist, composer, file, genre, track, tracks]);

  const addTracksToQueue = (atStart = true) => {
    const newQueueItems = items.map((item) => ({
      ...item,
      album: albums.find((a) => a.id === item.album.id),
    })) as TrackWithContent[];
    addToQueue(newQueueItems, atStart);
  };

  const replaceQueue = () => {
    const newQueueItems = items.map((item) => ({
      ...item,
      album: albums.find((a) => a.id === item.album.id),
    })) as TrackWithContent[];
    addToQueue(newQueueItems, false);
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
      <Button variant="ghost" className="w-fit self-start p-1 mx-1 px-2" aria-label="Play now" onClick={replaceQueue}>
        <Play /> {textLabels ? <span>Play</span> : null}
      </Button>
      <Button
        variant="ghost"
        aria-label="Queue at end of queue"
        className="w-fit self-start p-1 mr-1 px-2"
        onClick={() => addTracksToQueue(true)}
      >
        <ListStart className="scale-x-[-1]" /> {textLabels ? <span>Queue at front</span> : null}
      </Button>
      <Button
        variant="ghost"
        aria-label="Queue at start of queue"
        className="w-fit self-start p-1 px-2"
        onClick={() => addTracksToQueue(false)}
      >
        <ListEnd /> {textLabels ? <span>Queue at end</span> : null}
      </Button>
    </menu>
  );
}
