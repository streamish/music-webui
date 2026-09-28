import type { Track } from '@/hooks/user/use-tracks';

/**
 * Splits an array of tracks into two halves.
 * @param {Track[]} tracks The array of tracks to split.
 * @returns An array containing two arrays each representing a half of the original tracks array.
 */
export function splitInHalf(tracks: Track[]): Track[][] {
  return [tracks.slice(0, Math.ceil(tracks.length / 2)), tracks.slice(Math.ceil(tracks.length / 2))];
}

/**
 * Groups an array of tracks by their disc number if specified.  If unspecified or
 * if there is only one disc then a single group is returned.
 * @param {Track[]} tracks The array of tracks to group by disc number.
 * @returns {Track[][]} An array of track groups, each representing a disc.
 */
export function createTrackGroups(tracks: Track[]): Track[][] {
  if (tracks.length === 1) {
    return [tracks];
  }
  const discs: Track[][] = [];
  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i];
    if (track) {
      const disc = tracks[i].discNumber || 1;
      if (discs[disc - 1] === undefined) {
        discs[disc - 1] = [];
      }
      discs[disc - 1].push(track);
    }
  }
  if (discs.length === 1) {
    return [tracks.slice(0, Math.floor(tracks.length / 2)), tracks.slice(Math.floor(tracks.length / 2))];
  }
  return discs;
}
