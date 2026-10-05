import { PlaybackButton } from './playback-button';
import { Square } from 'lucide-react';
import { useQueueActions } from '@/features/library/queue';

export function PlaybackStopButton() {
  const { seek, togglePlay } = useQueueActions();
  const stopPlaying = () => {
    togglePlay(false);
    seek(0);
  };
  return <PlaybackButton icon={Square} label="Stop" onChange={stopPlaying} />;
}
