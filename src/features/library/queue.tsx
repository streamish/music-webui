import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { TrackWithContent } from '@/features/library/library';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type QueueDataValue = {
  queue: TrackWithContent[];
  currentIndex: number;
};

type QueuePlaybackValue = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isRepeating: boolean;
  isShuffling: boolean;
  volume: number;
};

type QueueActionsValue = {
  nextTrack: () => void;
  playTrack: (track: TrackWithContent, tracks?: TrackWithContent[]) => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsRepeating: React.Dispatch<React.SetStateAction<boolean>>;
  setIsShuffling: React.Dispatch<React.SetStateAction<boolean>>;
  addToQueue: (tracks: TrackWithContent[], atStart?: boolean) => void;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  togglePlay: (playing?: boolean) => void;
};

const QueueDataContext = createContext<QueueDataValue | null>(null);
const QueuePlaybackContext = createContext<QueuePlaybackValue | null>(null);
const QueueActionsContext = createContext<QueueActionsValue | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [queue, setQueue] = useState<TrackWithContent[]>([]);
  const [queueShuffled, setQueueShuffled] = useState<TrackWithContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffleIndex, setShuffleIndex] = useState(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (queue.length === 0) {
      setCurrentIndex(-1);
      setShuffleIndex(-1);
      setIsPlaying(false);
      return;
    }
    if (currentIndex === -1) {
      setCurrentIndex(0);
      setShuffleIndex(0);
    } else if (currentIndex >= queue.length) {
      setCurrentIndex(queue.length - 1);
    }
  }, [queue.length, currentIndex]);

  useEffect(() => {
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueueShuffled(shuffled);
  }, [queue]);

  const playTrack = useCallback((track: TrackWithContent, tracks: TrackWithContent[] = [track]) => {
    const index = tracks.findIndex((item) => item.id === track.id);
    setQueue(tracks);
    setCurrentIndex(index >= 0 ? index : 0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(
    (playing?: boolean) => {
      if (queue.length === 0) {
        return;
      }
      setIsPlaying((previoustrack) => playing ?? !previoustrack);
      if (currentIndex === -1) {
        setCurrentIndex(0);
      }
    },
    [queue.length, currentIndex],
  );

  const addToQueue = useCallback((tracks: TrackWithContent[], atStart = false) => {
    setQueue((prevQueue) => (atStart ? [...tracks, ...prevQueue] : [...prevQueue, ...tracks]));
  }, []);

  const nextShuffledTrack = useCallback(() => {
    if (queueShuffled.length === 0) {
      return undefined;
    }
    let nextIndex = shuffleIndex;
    if (nextIndex < queueShuffled.length - 1) {
      nextIndex += 1;
    } else if (isRepeating) {
      nextIndex = 0;
    }
    setShuffleIndex(nextIndex);
    return queue.indexOf(queueShuffled[nextIndex]);
  }, [queue, queueShuffled, shuffleIndex, isRepeating]);

  const previousShuffledTrack = useCallback(() => {
    if (queueShuffled.length === 0) {
      return undefined;
    }
    let previousIndex = shuffleIndex;
    if (previousIndex > 0) {
      previousIndex -= 1;
    } else if (isRepeating) {
      previousIndex = queueShuffled.length - 1;
    }
    setShuffleIndex(previousIndex);
    return queue.indexOf(queueShuffled[previousIndex]);
  }, [queue, queueShuffled, shuffleIndex, isRepeating]);

  const nextTrack = useCallback(() => {
    if (isShuffling) {
      const index = nextShuffledTrack();
      if (index !== undefined && index >= 0) {
        setCurrentIndex(index);
      }
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
    } else if (isRepeating && queue.length > 0) {
      setCurrentIndex(0);
    }
  }, [isShuffling, currentIndex, queue.length, isRepeating, nextShuffledTrack]);

  const previousTrack = useCallback(() => {
    if (isShuffling) {
      const index = previousShuffledTrack();
      if (index !== undefined && index >= 0) {
        setCurrentIndex(index);
      }
      return;
    }
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0) {
      setCurrentIndex(previousIndex);
    } else if (isRepeating && queue.length > 0) {
      setCurrentIndex(queue.length - 1);
    }
  }, [isShuffling, currentIndex, queue.length, isRepeating, previousShuffledTrack]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) {
      return;
    }
    const track = queue[currentIndex];
    if (!track) {
      return;
    }
    audio.pause();
    setCurrentTime(0);
    setDuration(0);
    audio.src = `${baseUrl}/api/guest/stream-file?id=${track.id}`;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentIndex, queue, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) {
      return;
    }
    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onEnded = () => {
      setCurrentIndex((index) => {
        if (index < queue.length - 1) {
          return index + 1;
        }

        setIsPlaying(false);
        return index;
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const dataValue = useMemo(
    () => ({
      queue,
      currentIndex,
    }),
    [queue, currentIndex],
  );

  const playbackValue = useMemo(
    () => ({
      currentTime,
      duration,
      isPlaying,
      isRepeating,
      isShuffling,
      volume,
    }),
    [currentTime, duration, isPlaying, isRepeating, isShuffling, volume],
  );

  const actionsValue = useMemo(
    () => ({
      addToQueue,
      nextTrack,
      playTrack,
      previousTrack,
      seek,
      setCurrentIndex,
      setIsRepeating,
      setIsShuffling,
      setVolume,
      togglePlay,
    }),
    [
      addToQueue,
      nextTrack,
      playTrack,
      previousTrack,
      seek,
      setCurrentIndex,
      setIsRepeating,
      setIsShuffling,
      setVolume,
      togglePlay,
    ],
  );

  return (
    <QueueDataContext.Provider value={dataValue}>
      <QueuePlaybackContext.Provider value={playbackValue}>
        <QueueActionsContext.Provider value={actionsValue}>
          <audio ref={audioRef} preload="metadata" />
          {children}
        </QueueActionsContext.Provider>
      </QueuePlaybackContext.Provider>
    </QueueDataContext.Provider>
  );
}

export function useQueueData() {
  const context = useContext(QueueDataContext);

  if (!context) {
    throw new Error('useQueueData must be used within QueueProvider');
  }

  return context;
}

export function useQueuePlayback() {
  const context = useContext(QueuePlaybackContext);

  if (!context) {
    throw new Error('useQueuePlayback must be used within QueueProvider');
  }

  return context;
}

export function useQueueActions() {
  const context = useContext(QueueActionsContext);

  if (!context) {
    throw new Error('useQueueActions must be used within QueueProvider');
  }

  return context;
}
