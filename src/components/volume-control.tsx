import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useQueueActions, useQueuePlayback } from '@/features/library/queue';
import { useState } from 'react';

export function VolumeControl() {
  const { volume } = useQueuePlayback();
  const { setVolume } = useQueueActions();
  const [showSlider, setShowSlider] = useState(false);
  const [isMute, setIsMute] = useState(volume === 0);

  let VolumeIcon;
  if (isMute) {
    VolumeIcon = VolumeX;
  } else if (volume > 0.5) {
    VolumeIcon = Volume2;
  } else if (volume > 0) {
    VolumeIcon = Volume1;
  } else {
    VolumeIcon = Volume;
  }

  const changeVolume = (value: number) => setVolume(value / 100);
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
      setIsMute(true);
    } else {
      setVolume(1);
      setIsMute(false);
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setShowSlider(true)} onMouseLeave={() => setShowSlider(false)}>
      <Button
        variant="ghost"
        size="icon-lg"
        className="m-2 h-16 w-16 flex-none p-2 text-center hover:bg-foreground/20!"
        onClick={() => toggleMute()}
      >
        <VolumeIcon className="relative left-1 h-8! w-8!" strokeWidth={1} />
      </Button>

      {showSlider && (
        <div
          className={`
            absolute left-1/2 -top-45 z-50 mt-2 w-10 
            -translate-x-1/2 rounded-md border bg-muted p-3 
            shadow-md`}
        >
          <Slider
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            orientation="vertical"
            onValueChange={([value]) => changeVolume(value)}
            aria-label="Volume"
          />
        </div>
      )}
    </div>
  );
}
