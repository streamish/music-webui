import { Pause, Play } from 'lucide-react';
import { PlaybackButton } from './playback-button';
import { useQueueActions, useQueuePlayback } from './queue';

export function PlaybackPlayButton() {
  const { isPlaying } = useQueuePlayback();
  const { togglePlay } = useQueueActions();
  return <PlaybackButton icon={isPlaying ? Pause : Play} label="Play/Pause" onChange={() => togglePlay(!isPlaying)} />;
}
