import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { TrackWithContent } from '@/features/library/library';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type QueueContextValue = {
  currentIndex: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isRepeating: boolean;
  isShuffling: boolean;
  queue: TrackWithContent[];
  volume: number;
  next: () => void;
  playTrack: (track: TrackWithContent, tracks?: TrackWithContent[]) => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsRepeating: React.Dispatch<React.SetStateAction<boolean>>;
  setIsShuffling: React.Dispatch<React.SetStateAction<boolean>>;
  setQueue: React.Dispatch<React.SetStateAction<TrackWithContent[]>>;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  togglePlay: (playing?: boolean) => void;
};

const QueueContext = createContext<QueueContextValue | null>(null);

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

  // Select the first item when items are added to an empty queue.
  useEffect(() => {
    if (queue.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      setShuffleIndex(0);
    }
    // Keep the index valid if the queue is replaced or shortened.
    if (queue.length === 0) {
      setCurrentIndex(-1);
      setIsPlaying(false);
    } else if (currentIndex >= queue.length) {
      setCurrentIndex(queue.length - 1);
    }
  }, [queue.length, currentIndex]);

  useEffect(() => {
    const shuffled = [...queue].sort(() => (Math.random() < 0.5 ? 1 : -1));
    setQueueShuffled(shuffled);
  }, [queue]);

  const playTrack = useCallback((track: TrackWithContent, tracks: TrackWithContent[] = [track]) => {
    const queueIndex = tracks.findIndex((item) => item.id === track.id);
    setQueue(tracks);
    setCurrentIndex(queueIndex >= 0 ? queueIndex : 0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(
    (playing?: boolean) => {
      if (!queue.length) {
        return;
      }
      setIsPlaying((previous) => playing ?? !previous);
      if (currentIndex === -1) {
        setCurrentIndex(0);
      }
    },
    [queue.length, currentIndex],
  );

  const prevShuffledTrack = useCallback(() => {
    let newIndex = shuffleIndex;
    if (newIndex > 0) {
      newIndex -= 1;
    } else if (isRepeating) {
      newIndex = queueShuffled.length - 1;
    }
    setShuffleIndex(newIndex);
    return queue.indexOf(queueShuffled[newIndex]);
  }, [currentIndex]);

  const nextShuffledTrack = useCallback(() => {
    let newIndex = shuffleIndex;
    if (newIndex < queueShuffled.length - 1) {
      newIndex += 1;
    } else if (isRepeating) {
      newIndex = 0;
    }
    setShuffleIndex(newIndex);
    return queue.indexOf(queueShuffled[newIndex]);
  }, [currentIndex]);

  const next = useCallback(() => {
    if (isShuffling) {
      const newIndex = nextShuffledTrack();
      if (newIndex !== undefined) {
        setCurrentIndex(newIndex);
      }
    } else {
      const nextIndex = currentIndex + 1;
      if (nextIndex < queue.length) {
        setCurrentIndex(nextIndex);
      } else if (isRepeating) {
        setCurrentIndex(0);
      }
    }
  }, [queue.length, currentIndex]);

  const previous = useCallback(() => {
    if (isShuffling) {
      const newIndex = prevShuffledTrack();
      if (newIndex !== undefined) {
        setCurrentIndex(newIndex);
      }
    } else {
      const previousIndex = currentIndex - 1;
      if (previousIndex > -1) {
        setCurrentIndex(previousIndex);
      } else if (isRepeating) {
        setCurrentIndex(queue.length - 1);
      }
    }
  }, [currentIndex]);

  // Fetch and load the current track.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) {
      return;
    }
    async function loadTrack(id: number) {
      if (audio) {
        audio.pause();
        setCurrentTime(0);
        setDuration(0);
        audio.src = `${baseUrl}/api/guest/stream-file?id=${id}`;
        audio.load();
        if (isPlaying) {
          try {
            await audio.play();
          } catch {
            // Autoplay may require a user gesture.
            setIsPlaying(false);
          }
        }
      }
    }
    loadTrack(queue[currentIndex]?.id);
  }, [currentIndex, queue]); // Deliberately load only when the track changes

  // Play or pause an already-loaded track.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) {
      return;
    }
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex, queue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setDuration(audio.duration);
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
    }
    return undefined;
  }, [queue.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  }, []);

  const value = {
    currentIndex,
    currentTime,
    duration,
    isPlaying,
    isRepeating,
    isShuffling,
    queue,
    volume,
    next,
    playTrack,
    previous,
    seek,
    setCurrentIndex,
    setIsRepeating,
    setIsShuffling,
    setQueue,
    setVolume,
    togglePlay,
  };

  return (
    <QueueContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error('useQueue must be used within QueueProvider');
  }

  return context;
}
