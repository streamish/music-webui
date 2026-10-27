import { type QueueEntry, isStation } from './queue-state';
import { useCallback, useEffect, useRef, useState } from 'react';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const streamUrl = (entry: QueueEntry) =>
  isStation(entry)
    ? `${baseUrl}/api/proxy-shoutcast-station?shoutcastStationUrl=${entry.url}`
    : `${baseUrl}/api/stream-track?id=${entry.id}`;

type AudioPlayerOptions = {
  item: QueueEntry | undefined;
  isPlaying: boolean;
  volume: number;
  // 'replay' restarts the current item, which is what a single repeated item needs.
  onEnded: () => 'advance' | 'replay' | 'stop';
  onPlayRejected: () => void;
};

// Owns the <audio> element: source loading, play/pause, volume, and playback position.
export function useAudioPlayer({ item, isPlaying, volume, onEnded, onPlayRejected }: AudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const isPlayingRef = useRef(isPlaying);
  const onEndedRef = useRef(onEnded);
  const onPlayRejectedRef = useRef(onPlayRejected);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onEndedRef.current = onEnded;
    onPlayRejectedRef.current = onPlayRejected;
  });

  const play = useCallback((audio: HTMLAudioElement) => {
    audio.play().catch(() => onPlayRejectedRef.current());
  }, []);

  // Reload the source whenever the item changes, including when the queue is replaced at the same index.
  // isPlaying is read through a ref so toggling playback does not reload.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item) {
      return;
    }
    audio.pause();
    setCurrentTime(0);
    setDuration(0);
    audio.src = streamUrl(item);
    audio.load();
    if (isPlayingRef.current) {
      play(audio);
    }
  }, [item, play]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item) {
      return;
    }
    if (isPlaying) {
      // Pausing a live station drops its source so the stream is not buffered; restore it on resume.
      if (isStation(item) && !audio.getAttribute('src')) {
        audio.src = streamUrl(item);
      }
      play(audio);
    } else if (isStation(item)) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    } else {
      audio.pause();
    }
  }, [isPlaying, item, play]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (onEndedRef.current() === 'replay') {
        audio.currentTime = 0;
        play(audio);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [play]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio || (item && isStation(item))) {
        return;
      }
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    },
    [item],
  );

  return { audioRef, currentTime, duration, seek };
}
