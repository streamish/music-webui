import { PlaybackCurrentItem } from './playback-current-item';
import { PlaybackDivider } from './playback-divider';
import { PlaybackNextButton } from './playback-next-button';
import { PlaybackPlayButton } from './playback-play-button';
import { PlaybackPreviousButton } from './playback-previous-button';
import { PlaybackRepeatButton } from './playback-repeat-button';
import { PlaybackSeekBar } from './playback-seek-bar';
import { PlaybackShuffleButton } from './playback-shuffle-button';
import { PlaybackStopButton } from './playback-stop-button';
import { PlaybackToggleQueueButton } from './playback-toggle-queue-button';
import { PlaybackVolumeControlSlider } from './playback-volume-control-slider';
import { useState } from 'react';
import QueueTable from '@/features/library/queue-table';
import useLockBodyScroll from '@/hooks/use-lock-body-scroll';

export function QueueControls() {
  const [isShowingQueue, setIsShowingQueue] = useState(false);
  useLockBodyScroll(isShowingQueue);

  return (
    <>
      {isShowingQueue && (
        <div className="fixed overflow-y-scroll bg-muted h-full w-full top-0 left-0 pb-22 z-9999">
          <QueueTable />
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-9999 h-16 md:h-18 lg:h-22 xl:h-24 bg-muted/95">
        <PlaybackSeekBar />
        <div className="flex flex-row align-middle justify-center h-12 md:h-14 lg:h-18 xl:h-20 bg-muted/95">
          {/* Playback controls: only take the space they need */}
          <div className="flex flex-none flex-row">
            <div className="flex flex-row">
              <PlaybackPreviousButton />
              <PlaybackPlayButton />
              <PlaybackNextButton />
              <PlaybackStopButton />
            </div>
            <PlaybackDivider />
          </div>
          {/* Current media: occupies all remaining space, hidden in extra small */}
          <div className="hidden lg:flex min-w-0 flex-1 flex-row">
            <PlaybackCurrentItem />
          </div>
          {/* Right-side controls: only take the space they need */}
          <div className="flex flex-none flex-row h-12 md:h-14 lg:h-18 xl:h-20">
            <PlaybackDivider className="hidden lg:block" />
            <div className="flex flex-none flex-row">
              <PlaybackToggleQueueButton
                isShowingQueue={isShowingQueue}
                onChange={() => setIsShowingQueue((prev) => !prev)}
              />
              <PlaybackRepeatButton className="hidden md:inline-flex lg:inline-flex xl:inline-flex" />
              <PlaybackShuffleButton className="hidden md:inline-flex lg:inline-flex xl:inline-flex" />
            </div>
            <PlaybackDivider className="hidden md:block lg:block" />
            <div className="hidden md:flex lg:flex flex-col">
              <PlaybackVolumeControlSlider />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
