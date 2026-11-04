import { AddToPlaylistButton } from '@/features/library/add-to-playlist-button';
import { FavoriteControls } from './add-to-favorite-button';
import { PlayControls } from './play-controls';
import { colorDistance, getTrackPalette } from '@/utils/color';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import type { components } from '@/types/api-schema';

type Track = components['schemas']['LibraryTrackDto'];

export function AlbumTrackList({ tracks }: { tracks: Track[] }) {
  const styles = getComputedStyle(document.documentElement);
  const foreground = styles.getPropertyValue('--foreground').trim();
  const muted = styles.getPropertyValue('--muted').trim();
  return (
    <ol>
      {tracks.map((track) => {
        const trackColor = getTrackPalette(track).foreground;
        const shadowColor = colorDistance(trackColor, foreground) < 50 ? muted : foreground;
        return (
          <li
            key={`filler-${track.id}`}
            className={['bg-foreground/20 first:rounded-t-lg last:rounded-b-lg mb-px'].join(' ')}
          >
            <div
              className={[
                `flex flex-row text-sm items-center justify-between`,
                `hover:bg-background/10 p-1 cursor-pointer`,
                'font-semibold',
                `[text-shadow:0_1px_1px_color-mix(in_srgb,${shadowColor}_30%,transparent)]`,
              ].join(' ')}
              style={{
                color: trackColor,
              }}
            >
              <span className="p-1 opacity-50 w-8 text-right inline-block">{track.trackNumber}.</span>{' '}
              <span className="text-left w-full h-full items-center flex flex-row">
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
        );
      })}
    </ol>
  );
}
