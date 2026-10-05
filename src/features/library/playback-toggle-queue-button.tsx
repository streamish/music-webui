import { Logs } from 'lucide-react';
import { PlaybackButton } from './playback-button';

export function PlaybackToggleQueueButton({
  isShowingQueue,
  onChange,
}: {
  isShowingQueue: boolean;
  onChange: () => void;
}) {
  return (
    <PlaybackButton label="Show or hide playback queue" isActive={isShowingQueue} onChange={onChange} icon={Logs} />
  );
}
