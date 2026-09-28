import { PlaybackControls } from './playback-controls';
import { secondsToMinutesAndSeconds } from '@/utils/format';
import type { components } from '@/types/api-schema';

type Album = components['schemas']['LibraryAlbumWithTracksDto'];
type Track = components['schemas']['LibraryAlbumWithTracksDto']['tracks'][number];

export function TrackTable({ albums, tracks }: { albums?: Album[]; tracks?: Track[] }) {
  const trackList = tracks || (albums?.flatMap((album) => album.tracks) ?? []);
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="px-2 py-1 text-left text-foreground/70">Title</th>
          <th className="px-2 py-1 text-left text-foreground/70">Time</th>
          <th className="px-2 py-1 text-left text-foreground/70">Album</th>
          <th className="px-2 py-1 text-left text-foreground/70">Album Artist</th>
          <th className="px-2 py-1 text-left text-foreground/70">Track Artist</th>
          <th className="px-2 py-1 text-left text-foreground/70">Track Composers</th>
          <th className="px-2 py-1 text-left text-foreground/70">Genres</th>
          <th className="px-2 py-1 text-left text-foreground/70"></th>
        </tr>
      </thead>
      <tbody>
        {trackList.map((track, index) => (
          <tr
            key={track.id}
            className={[`py-1 ${index % 2 === 0 ? 'bg-foreground/5' : ''}`, `hover:bg-foreground/10`].join(' ')}
          >
            <td className="px-2 py-1 text-left text-foreground/70">{track.title}</td>
            <td className="px-2 py-1 text-left text-foreground/70">{secondsToMinutesAndSeconds(track.duration)}</td>
            <td className="px-2 py-1 text-left text-foreground/70">{track.albumTitle}</td>
            <td className="px-2 py-1 text-left text-foreground/70">
              {track.albumArtists.map((artist) => {
                return (
                  <span key={artist.id} className="block mb-2">
                    <a href="#">{artist.name}</a>
                  </span>
                );
              })}
            </td>
            <td className="px-2 py-1 text-left text-foreground/70">
              {track.artists.map((artist) => {
                return (
                  <span key={artist.id} className="block mb-2">
                    <a href="#">{artist.name}</a>
                  </span>
                );
              })}
            </td>
            <td className="px-2 py-1 text-left text-foreground/70">
              {track.composers.map((artist) => {
                return (
                  <span key={artist.id} className="block mb-2">
                    <a href="#">{artist.name}</a>
                  </span>
                );
              })}
            </td>
            <td className="px-2 py-1 text-left text-foreground/70">
              {track.genres.map((genre) => (
                <span key={genre.id} className="block mb-2">
                  {genre.name}
                </span>
              ))}
            </td>
            <td>
              <PlaybackControls tracks={[track]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
