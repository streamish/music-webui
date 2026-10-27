import {
  type QueueEntry,
  type Station,
  type Track,
  adjacentIndex,
  initialQueueState,
  queueReducer,
} from './queue-state';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useAudioPlayer } from './use-audio-player';

type QueueDataValue = {
  queue: QueueEntry[];
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
  addToQueue: (tracks: Track[], atStart?: boolean) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  playStation: (station: Station) => void;
  playTrack: (track: Track, tracks?: Track[]) => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  setCurrentIndex: (index: number) => void;
  setIsRepeating: React.Dispatch<React.SetStateAction<boolean>>;
  setIsShuffling: React.Dispatch<React.SetStateAction<boolean>>;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  togglePlay: (playing?: boolean) => void;
};

const QueueDataContext = createContext<QueueDataValue | null>(null);
const QueuePlaybackContext = createContext<QueuePlaybackValue | null>(null);
const QueueActionsContext = createContext<QueueActionsValue | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [volume, setVolume] = useState(1);
  const { items: queue, currentIndex } = state;

  const stateRef = useRef({ state, isShuffling, isRepeating });
  useEffect(() => {
    stateRef.current = { state, isShuffling, isRepeating };
  });

  const handleEnded = useCallback(() => {
    const { state: latest, isShuffling: shuffling, isRepeating: repeating } = stateRef.current;
    const next = adjacentIndex(latest, 1, shuffling, repeating);
    if (next === null) {
      setIsPlaying(false);
      return 'stop';
    }
    if (next === latest.currentIndex) {
      return 'replay';
    }
    dispatch({ type: 'step', direction: 1, shuffling, repeating });
    return 'advance';
  }, []);

  const { audioRef, currentTime, duration, seek } = useAudioPlayer({
    item: queue[currentIndex],
    isPlaying,
    volume,
    onEnded: handleEnded,
    onPlayRejected: useCallback(() => setIsPlaying(false), []),
  });

  const playTrack = useCallback((track: Track, tracks: Track[] = [track]) => {
    const index = tracks.findIndex((item) => item.id === track.id);
    dispatch({ type: 'replace', items: tracks, currentIndex: Math.max(index, 0) });
    setIsPlaying(true);
  }, []);

  const playStation = useCallback((station: Station) => {
    dispatch({ type: 'replace', items: [station], currentIndex: 0 });
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback((playing?: boolean) => {
    if (stateRef.current.state.items.length === 0) {
      return;
    }
    setIsPlaying((previous) => playing ?? !previous);
  }, []);

  const addToQueue = useCallback((tracks: Track[], atStart = false) => {
    dispatch({ type: 'add', tracks, atStart });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'clear' });
    setIsPlaying(false);
  }, []);

  const nextTrack = useCallback(() => {
    dispatch({ type: 'step', direction: 1, shuffling: isShuffling, repeating: isRepeating });
  }, [isShuffling, isRepeating]);

  const previousTrack = useCallback(() => {
    dispatch({ type: 'step', direction: -1, shuffling: isShuffling, repeating: isRepeating });
  }, [isShuffling, isRepeating]);

  const setCurrentIndex = useCallback((index: number) => {
    dispatch({ type: 'jump', index });
  }, []);

  const dataValue = useMemo(() => ({ queue, currentIndex }), [queue, currentIndex]);

  const playbackValue = useMemo(
    () => ({ currentTime, duration, isPlaying, isRepeating, isShuffling, volume }),
    [currentTime, duration, isPlaying, isRepeating, isShuffling, volume],
  );

  const actionsValue = useMemo(
    () => ({
      addToQueue,
      clearQueue,
      nextTrack,
      playStation,
      playTrack,
      previousTrack,
      seek,
      setCurrentIndex,
      setIsRepeating,
      setIsShuffling,
      setVolume,
      togglePlay,
    }),
    [addToQueue, clearQueue, nextTrack, playStation, playTrack, previousTrack, seek, setCurrentIndex, togglePlay],
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
