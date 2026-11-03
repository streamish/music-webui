import { AddToPlaylistButton } from '@/features/library/add-to-playlist-button';
import { FavoriteControls } from './add-to-favorite-button';
import { PlayControls } from './play-controls';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import type { components } from '@/types/api-schema';

type Track = components['schemas']['LibraryTrackDto'];

export function AlbumTrackList({ tracks }: { tracks: Track[] }) {
  return (
    <ol>
      {tracks.map((track) => (
        <li key={`filler-${track.id}`}>
          <div
            className={[
              `flex flex-row text-sm items-center justify-between`,
              `border-dotted border-b border-background/25`,
              `hover:bg-background/10 hover:rounded-md not-first:0 p-1 cursor-pointer`,
            ].join(' ')}
            style={{
              color: track.albumCoverImageLightMuted,
              mixBlendMode: 'difference',
            }}
          >
            <span className="p-1 opacity-50 w-8 text-right inline-block">{track.trackNumber}.</span>{' '}
            <span className="text-left w-full h-full px-4 items-center flex flex-row">
              <PlayControls
                tracks={[track]}
                hideQueueButtons={true}
                hideEditButton={true}
                hideRatingButtons={true}
                className="inline-block"
              />
              <span className="w-auto">{track.title}</span>
              <FavoriteControls track={track} className="mb-0" />
              <AddToPlaylistButton track={track} className="mb-0" />
            </span>
            <span className="opacity-50 pr-1">{secondsToMinutesAndSeconds(track.duration)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
