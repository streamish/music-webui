import { PlaybackButton } from './playback-button';
import { Repeat } from 'lucide-react';
import { useQueueActions, useQueuePlayback } from '@/features/library/queue';

export function PlaybackRepeatButton({ className }: { className?: string }) {
  const { isRepeating } = useQueuePlayback();
  const { setIsRepeating } = useQueueActions();
  return (
    <PlaybackButton
      className={className}
      label="Repeat playback queue"
      isActive={isRepeating}
      onChange={() => setIsRepeating((prev) => !prev)}
      icon={Repeat}
    />
  );
}
