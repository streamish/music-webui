import { ChevronLast } from 'lucide-react';
import { PlaybackButton } from './playback-button';
import { useQueueActions } from './queue';

export function PlaybackNextButton() {
  const { nextTrack } = useQueueActions();
  return <PlaybackButton icon={ChevronLast} label="Next Track" onChange={nextTrack} />;
}
