import { PlaybackButton } from './playback-button';
import { Shuffle } from 'lucide-react';
import { useQueueActions, useQueuePlayback } from '@/features/library/queue';

export function PlaybackShuffleButton({ className }: { className?: string }) {
  const { isShuffling } = useQueuePlayback();
  const { setIsShuffling } = useQueueActions();
  return (
    <PlaybackButton
      className={className}
      label="Shuffle playback order"
      isActive={isShuffling}
      onChange={() => setIsShuffling((prev) => !prev)}
      icon={Shuffle}
    />
  );
}
