import { createContext, useContext, useMemo } from 'react';
import { nanoStorage } from '@qantesm/nanostorage';
import { useQuery } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from '@/types/api-schema';

type AlbumsRequest = paths['/api/user/list-albums-with-tracks']['get'];
type AlbumsResponse = AlbumsRequest['responses'];
type AlbumsData = AlbumsResponse['200']['content']['application/json'];
type FoldersRequest = paths['/api/user/folder-structure']['get'];
type FoldersResponse = FoldersRequest['responses'];

export type Album = AlbumsData['albums'][number];
export type Artist = Album['artists'][number];
export type Composer = Album['composers'][number];
export type Genre = Album['genres'][number];
export type Track = Album['tracks'][number];
export type TreeItemDto = FoldersResponse['200']['content']['application/json']['items'][number];

export function createTrackGroups(tracks: Array<Track>) {
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

  return discs.length === 1
    ? [tracks.slice(0, Math.ceil(tracks.length / 2)), tracks.slice(Math.ceil(tracks.length / 2))]
    : discs;
}

type AlbumWithIdReferences = Omit<Album, 'artists' | 'composers' | 'genres' | 'tracks'> & {
  artistIds: number[];
  composerIds: number[];
  genreIds: number[];
  trackIds: number[];
};

type TrackWithIdReferences = Omit<Track, 'artists' | 'composers' | 'genres'> & {
  albumId: number;
  artistIds: number[];
  composerIds: number[];
  genreIds: number[];
};

type ArtistWithIdReferences = Artist & {
  albumIds: number[];
};

type ComposerWithIdReferences = Composer & {
  albumIds: number[];
};

type GenreWithIdReferences = Genre & {
  albumIds: number[];
};

export type TrackWithContent = Track & {
  album: Album;
};

export type ArtistWithContents = Artist & {
  albums: Album[];
};

export type ComposerWithContents = Composer & {
  albums: Album[];
};

export type GenreWithContents = Genre & {
  albums: Album[];
};

const albumIndex: Record<number, AlbumWithIdReferences> = {};
const artistIndex: Record<number, ArtistWithIdReferences> = {};
const composerIndex: Record<number, ComposerWithIdReferences> = {};
const genreIndex: Record<number, GenreWithIdReferences> = {};
const trackIndex: Record<number, TrackWithIdReferences> = {};

function addOrUpdateArtist(artist: ArtistWithIdReferences, albumId: number) {
  if (artistIndex[artist.id]) {
    artistIndex[artist.id].name = artist.name;
    artistIndex[artist.id].albumIds = artistIndex[artist.id].albumIds || [];
    if (!artistIndex[artist.id].albumIds.includes(albumId)) {
      artistIndex[artist.id].albumIds.push(albumId);
    }
  } else {
    artistIndex[artist.id] = artist;
    artistIndex[artist.id].albumIds = [albumId];
  }
}

function addOrUpdateGenre(genre: GenreWithIdReferences, albumId: number) {
  if (genreIndex[genre.id]) {
    genreIndex[genre.id].name = genre.name;
    genreIndex[genre.id].albumIds = genreIndex[genre.id].albumIds || [];
    if (!genreIndex[genre.id].albumIds.includes(albumId)) {
      genreIndex[genre.id].albumIds.push(albumId);
    }
  } else {
    genreIndex[genre.id] = genre;
    genreIndex[genre.id].albumIds = [albumId];
  }
}

function addOrUpdateComposer(composer: ComposerWithIdReferences, albumId: number) {
  if (composerIndex[composer.id]) {
    composerIndex[composer.id].name = composer.name;
    composerIndex[composer.id].albumIds = composerIndex[composer.id].albumIds || [];
    if (!composerIndex[composer.id].albumIds.includes(albumId)) {
      composerIndex[composer.id].albumIds.push(albumId);
    }
  } else {
    composerIndex[composer.id] = composer;
    composerIndex[composer.id].albumIds = [albumId];
  }
}

function indexAlbumsData(data?: AlbumsData) {
  if (!data) {
    return;
  }
  // update-in-place the genres, composers and artists so their information
  // changes but references to the objects remain the same
  for (let i = 0, len = data.albums.length; i < len; i += 1) {
    const album = data.albums[i];
    const albumWithIds = album as unknown as AlbumWithIdReferences;
    // update the album genres
    albumWithIds.genreIds = [];
    for (let j = 0, jLen = album.genres.length; j < jLen; j += 1) {
      const genre = album.genres[j] as GenreWithIdReferences;
      addOrUpdateGenre(genre, album.id);
      albumWithIds.genreIds[j] = genre.id;
    }
    // update the album composers
    albumWithIds.composerIds = [];
    for (let j = 0, jLen = album.composers.length; j < jLen; j += 1) {
      const composer = album.composers[j] as ComposerWithIdReferences;
      addOrUpdateComposer(composer, album.id);
      albumWithIds.composerIds[j] = composer.id;
    }
    // update the album artists
    albumWithIds.artistIds = [];
    for (let j = 0, jLen = album.artists.length; j < jLen; j += 1) {
      const artist = album.artists[j] as ArtistWithIdReferences;
      addOrUpdateArtist(artist, album.id);
      albumWithIds.artistIds[j] = artist.id;
    }
    // update the album tracks
    albumWithIds.trackIds = [];
    for (let j = 0, jLen = album.tracks.length; j < jLen; j += 1) {
      const track = album.tracks[j];
      const trackWithIds = track as unknown as TrackWithIdReferences;
      trackWithIds.albumId = album.id;
      albumWithIds.trackIds[j] = track.id;
      // update the track artists
      trackWithIds.artistIds = [];
      for (let k = 0, kLen = track.artists.length; k < kLen; k += 1) {
        const artist = track.artists[k] as ArtistWithIdReferences;
        addOrUpdateArtist(artist, album.id);
        trackWithIds.artistIds[k] = artist.id;
      }
      // update the track composers
      trackWithIds.composerIds = [];
      for (let k = 0, kLen = track.composers.length; k < kLen; k += 1) {
        const composer = track.composers[k] as ComposerWithIdReferences;
        addOrUpdateComposer(composer, album.id);
        trackWithIds.composerIds[k] = composer.id;
      }
      // update the track genres
      trackWithIds.genreIds = [];
      for (let k = 0, kLen = track.genres.length; k < kLen; k += 1) {
        const genre = track.genres[k] as GenreWithIdReferences;
        addOrUpdateGenre(genre, album.id);
        trackWithIds.genreIds[k] = genre.id;
      }
    }
    // update the album
    if (albumIndex[album.id]) {
      albumIndex[album.id].artistIds = albumWithIds.artistIds;
      albumIndex[album.id].composerIds = albumWithIds.composerIds;
      albumIndex[album.id].coverImageDarkMuted = albumWithIds.coverImageDarkMuted;
      albumIndex[album.id].coverImageDarkVibrant = albumWithIds.coverImageDarkVibrant;
      albumIndex[album.id].coverImageLightMuted = albumWithIds.coverImageLightMuted;
      albumIndex[album.id].coverImageLightVibrant = albumWithIds.coverImageLightVibrant;
      albumIndex[album.id].coverImageMuted = albumWithIds.coverImageMuted;
      albumIndex[album.id].coverImageVibrant = albumWithIds.coverImageVibrant;
      albumIndex[album.id].createdAt = albumWithIds.createdAt;
      albumIndex[album.id].genreIds = albumWithIds.genreIds;
      albumIndex[album.id].rating = albumWithIds.rating;
      albumIndex[album.id].title = albumWithIds.title;
      albumIndex[album.id].trackIds = albumWithIds.trackIds;
      albumIndex[album.id].year = albumWithIds.year;
    } else {
      albumIndex[album.id] = {
        artistIds: albumWithIds.artistIds,
        composerIds: albumWithIds.composerIds,
        coverImageDarkMuted: albumWithIds.coverImageDarkMuted,
        coverImageDarkVibrant: albumWithIds.coverImageDarkVibrant,
        coverImageLightMuted: albumWithIds.coverImageLightMuted,
        coverImageLightVibrant: albumWithIds.coverImageLightVibrant,
        coverImageMuted: albumWithIds.coverImageMuted,
        coverImageVibrant: albumWithIds.coverImageVibrant,
        createdAt: albumWithIds.createdAt,
        genreIds: albumWithIds.genreIds,
        id: albumWithIds.id,
        rating: albumWithIds.rating,
        title: albumWithIds.title,
        trackIds: albumWithIds.trackIds,
        year: albumWithIds.year,
      };
    }
    // update the album tracks
    for (let j = 0, jLen = album.tracks.length; j < jLen; j += 1) {
      const track = album.tracks[j] as unknown as TrackWithIdReferences;
      if (trackIndex[track.id]) {
        trackIndex[track.id].title = track.title;
        trackIndex[track.id].duration = track.duration;
        trackIndex[track.id].artistIds = track.artistIds;
        trackIndex[track.id].composerIds = track.composerIds;
        trackIndex[track.id].genreIds = track.genreIds;
      } else {
        trackIndex[track.id] = track;
      }
    }
  }
}

async function fetchAlbums(query?: AlbumsRequest['parameters']['query']): Promise<AlbumsData> {
  const { data, error } = await api.get('/api/user/list-albums-with-tracks', {
    params: {
      query,
      header: api.authHeader(),
    },
  });
  if (error) {
    throw new TypedApiError<AlbumsResponse['400']['content']['application/json']['message'][number]>(
      error.message,
      error.error,
    );
  }
  if (!data) {
    throw new Error('No data received');
  }
  return data;
}

async function fetchAlbumsThroughCache(query?: AlbumsRequest['parameters']['query']) {
  const cachedData = await nanoStorage.getItem<AlbumsData>('library');
  if (cachedData) {
    indexAlbumsData(cachedData);
    return cachedData;
  }
  const data = await fetchAlbums(query);
  indexAlbumsData(data);
  await nanoStorage.setItem('library', data);
  return data;
}

const rebuilder = {
  mapAlbum: (id: number, nestedDepth = 1): Album => {
    const albumData = albumIndex[id];
    return {
      ...albumData,
      artists:
        nestedDepth > 1 ? albumData.artistIds.map((artistId) => rebuilder.mapArtist(artistId, nestedDepth - 1)) : [],
      composers:
        nestedDepth > 1
          ? albumData.composerIds.map((composerId) => rebuilder.mapComposer(composerId, nestedDepth - 1))
          : [],
      genres: nestedDepth > 1 ? albumData.genreIds.map((genreId) => rebuilder.mapGenre(genreId, nestedDepth - 1)) : [],
      tracks: nestedDepth > 1 ? albumData.trackIds.map((trackId) => rebuilder.mapTrack(trackId, nestedDepth - 1)) : [],
    };
  },
  mapArtist: (id: number, nestedDepth = 1): ArtistWithContents => {
    const artistData = artistIndex[id];
    return {
      createdAt: artistData.createdAt,
      id: artistData.id,
      name: artistData.name,
      albums: nestedDepth > 1 ? artistData.albumIds.map((albumId) => rebuilder.mapAlbum(albumId, nestedDepth - 1)) : [],
    };
  },
  mapComposer: (id: number, nestedDepth = 1): ComposerWithContents => {
    const composerData = composerIndex[id];
    return {
      createdAt: composerData.createdAt,
      id: composerData.id,
      name: composerData.name,
      albums:
        nestedDepth > 1 ? composerData.albumIds.map((albumId) => rebuilder.mapAlbum(albumId, nestedDepth - 1)) : [],
    };
  },
  mapGenre: (id: number, nestedDepth = 1): GenreWithContents => {
    const genreData = genreIndex[id];
    return {
      id: genreData.id,
      name: genreData.name,
      albums: nestedDepth > 1 ? genreData.albumIds.map((albumId) => rebuilder.mapAlbum(albumId, nestedDepth - 1)) : [],
    };
  },
  mapTrack: (id: number, nestedDepth = 1): TrackWithContent => {
    const trackData = trackIndex[id];
    return {
      ...trackData,
      album: rebuilder.mapAlbum(trackData.albumId, nestedDepth - 1),
      artists: trackData.artistIds.map((artistId) => rebuilder.mapArtist(artistId, nestedDepth - 1)),
      composers: trackData.composerIds.map((composerId) => rebuilder.mapComposer(composerId, nestedDepth - 1)),
      genres: trackData.genreIds.map((genreId) => rebuilder.mapGenre(genreId, nestedDepth - 1)),
    };
  },
};

export function useAlbumData(query?: AlbumsRequest['parameters']['query']) {
  return useQuery({
    queryKey: ['albumsWithTracks', query],
    queryFn: () => fetchAlbumsThroughCache(),
    staleTime: Infinity,
  });
}

export type LibraryContextValue = {
  albums: Album[];
  albumArtists: ArtistWithContents[];
  artists: ArtistWithContents[];
  composers: ComposerWithContents[];
  folders: TreeItemDto[];
  genres: GenreWithContents[];
  tracks: TrackWithContent[];
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { data: albumsData } = useAlbumData({});

  const listAlbums = (): Album[] =>
    Object.values(albumIndex)
      .map((album) => rebuilder.mapAlbum(album.id, 2))
      .sort((a, b) => a.title.localeCompare(b.title));

  const listAlbumArtists = (): ArtistWithContents[] =>
    Object.values(albumIndex)
      .flatMap((album) => album.artistIds)
      .map((artistId) => rebuilder.mapArtist(artistId, 3))
      .filter((artist, index, self) => self.findIndex((a) => a.id === artist.id) === index)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => {
        item.albums.sort((a, b) => {
          const artistA = a.artists.map((artist) => artist.name).join(', ');
          const artistB = b.artists.map((artist) => artist.name).join(', ');
          return artistA.localeCompare(artistB) || a.title.localeCompare(b.title);
        });
        return item;
      });

  const listArtists = (): ArtistWithContents[] =>
    Object.values(artistIndex)
      .map((artist) => rebuilder.mapArtist(artist.id, 3))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => {
        item.albums.sort((a, b) => {
          const artistA = a.artists.map((artist) => artist.name).join(', ');
          const artistB = b.artists.map((artist) => artist.name).join(', ');
          return artistA.localeCompare(artistB) || a.title.localeCompare(b.title);
        });
        return item;
      });

  const listComposers = (): ComposerWithContents[] =>
    Object.values(composerIndex)
      .map((composer) => rebuilder.mapComposer(composer.id, 3))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => {
        item.albums.sort((a, b) => {
          const artistA = a.artists.map((artist) => artist.name).join(', ');
          const artistB = b.artists.map((artist) => artist.name).join(', ');
          return artistA.localeCompare(artistB) || a.title.localeCompare(b.title);
        });
        return item;
      });

  const listGenres = (): GenreWithContents[] =>
    Object.values(genreIndex)
      .map((genre) => rebuilder.mapGenre(genre.id, 3))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => {
        item.albums.sort((a, b) => {
          const artistA = a.artists.map((artist) => artist.name).join(', ');
          const artistB = b.artists.map((artist) => artist.name).join(', ');
          return artistA.localeCompare(artistB) || a.title.localeCompare(b.title);
        });
        return item;
      });

  const listTracks = (): TrackWithContent[] =>
    Object.values(trackIndex)
      .map((track) => rebuilder.mapTrack(track.id, 2))
      .sort((a, b) => a.title.localeCompare(b.title));

  const buildTree = (tracks: TrackWithContent[]): TreeItemDto[] => {
    const root: TreeItemDto = {
      folder: '',
      file: '',
      fullPath: '',
      id: 0,
      children: [],
    };
    let folderId = 0;
    const directoryMap = new Map([['', root]]);
    for (let i = 0, len = tracks?.length; i < len; i += 1) {
      const track = tracks[i];
      const { filePath } = track;
      const parts = filePath.split('/').filter(Boolean);
      let currentPath = '';
      let parent = root;
      for (let j = 0, jLen = parts.length; j < jLen; j += 1) {
        const part = parts[j];
        currentPath += `/${part}`;
        let node = directoryMap.get(currentPath);
        if (!node) {
          const isFile = j === parts.length - 1;
          if (!isFile) {
            folderId += 1;
          }
          node = {
            folder: isFile ? '' : part,
            file: isFile ? part : '',
            fullPath: currentPath,
            ...(isFile ? track : { children: [], id: folderId }),
          };
          parent.children?.push(node);
          directoryMap.set(currentPath, node);
        }
        parent = node;
      }
    }
    function sortChildren(node: TreeItemDto) {
      node.children?.sort((a, b) => (a.folder || a.file || '').localeCompare(b.folder || b.file || ''));
      node.children?.forEach(sortChildren);
    }
    sortChildren(root);
    return root.children || [];
  };

  const albums = useMemo(() => listAlbums(), [albumsData]);
  const albumArtists = useMemo(() => listAlbumArtists(), [albumsData]);
  const artists = useMemo(() => listArtists(), [albumsData]);
  const composers = useMemo(() => listComposers(), [albumsData]);
  const genres = useMemo(() => listGenres(), [albumsData]);
  const tracks = useMemo(() => listTracks(), [albumsData]);
  const folders = useMemo(() => buildTree(tracks), [tracks]);

  return (
    <LibraryContext.Provider
      value={{
        albums,
        albumArtists,
        artists,
        composers,
        folders,
        genres,
        tracks,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}
