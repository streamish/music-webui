import { Tally1 } from 'lucide-react';

export function PlaybackDivider({ className }: { className?: string }) {
  return (
    <div className={`h-12 md:h-16 lg:h-20 w-6 flex-none overflow-hidden ${className || ''}`}>
      <Tally1 className="h-12 md:h-16 lg:h-20 w-12 md:w-16 lg:w-20" strokeWidth="0.1" />
    </div>
  );
}
