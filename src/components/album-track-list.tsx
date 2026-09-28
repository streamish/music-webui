import { PlaybackControls } from './playback-controls';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import type { Track } from '@/hooks/user/use-tracks';

export function AlbumTrackList({ tracks }: { tracks: Track[] }) {
  return (
    <ol>
      {tracks.map((track) => (
        <li key={`filler-${track.id}`}>
          <div
            className={[
              `flex flex-row text-sm justify-between`,
              `border-dotted border-b border-background/25`,
              `hover:bg-background/10 hover:rounded-md not-first:0 px-2 py-2 cursor-pointer`,
            ].join(' ')}
            style={{
              color: track.albumCoverImageLightMuted,
              mixBlendMode: 'difference',
            }}
          >
            <span className="p-1 opacity-50 w-8 text-right inline-block">{track.trackNumber}.</span>{' '}
            <span className="text-left w-full px-4 flex flex-row">
              <span className="p-1">{track.title}</span>
              <PlaybackControls
                tracks={[track]}
                hideQueueButtons={true}
                hideEditButton={true}
                className="inline-block"
              />
            </span>
            <span className="opacity-50 p-1">{secondsToMinutesAndSeconds(track.duration)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
