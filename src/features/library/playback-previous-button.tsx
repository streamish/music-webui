import { ChevronFirst } from 'lucide-react';
import { PlaybackButton } from './playback-button';
import { useQueueActions } from './queue';

export function PlaybackPreviousButton() {
  const { previousTrack } = useQueueActions();
  return <PlaybackButton icon={ChevronFirst} label="Previous Track" onChange={previousTrack} />;
}
