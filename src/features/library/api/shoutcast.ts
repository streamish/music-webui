import { queryOptions, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const shoutcastKeys = {
  all: ['shoutcast'] as const,
  genres: () => [...shoutcastKeys.all, 'genres'] as const,
  stations: () => [...shoutcastKeys.all, 'stations'] as const,
  favorites: () => [...shoutcastKeys.all, 'favorites'] as const,
  onlineStations: (genreId: number) => [...shoutcastKeys.all, 'online-stations', genreId] as const,
  currentPlaying: (stationUrl: string) => [...shoutcastKeys.all, 'current-playing', stationUrl] as const,
};

export const shoutcastGenresQuery = () =>
  queryOptions({
    queryKey: shoutcastKeys.genres(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-shoutcast-genres');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No genres returned');
      }
      return data.genres;
    },
  });

export const shoutcastStationsQuery = () =>
  queryOptions({
    queryKey: shoutcastKeys.stations(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-shoutcast-stations');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No stations returned');
      }
      return data.stations;
    },
  });

export const shoutcastFavoritesQuery = () =>
  queryOptions({
    queryKey: shoutcastKeys.favorites(),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-favorites');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No favorites returned');
      }
      return data.favorites.filter((favorite) => favorite.shoutcastStation?.id);
    },
  });

export const shoutcastOnlineStationsQuery = (genreId: number) =>
  queryOptions({
    queryKey: shoutcastKeys.onlineStations(genreId),
    queryFn: async () => {
      const { data, error } = await api.get('/api/list-online-shoutcast-stations', {
        params: {
          query: {
            id: genreId,
          },
        },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data.stations?.length) {
        throw new Error('No stations returned');
      }
      return data.stations;
    },
  });

export const shoutcastCurrentPlayingQuery = (shoutcastStationUrl: string) =>
  queryOptions({
    enabled: !!shoutcastStationUrl,
    refetchInterval: 1000 * 10,
    queryKey: shoutcastKeys.currentPlaying(shoutcastStationUrl),
    queryFn: async () => {
      const { data, error } = await api.get('/api/retrieve-shoutcast-playing', {
        params: { query: { shoutcastStationUrl } },
      });
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No album returned');
      }
      return data.title || 'Unknown Title';
    },
  });

export const useShoutcastGenres = () => useQuery(shoutcastGenresQuery());
export const useShoutcastStations = () => useQuery(shoutcastStationsQuery());
export const useShoutcastFavorites = () => useQuery(shoutcastFavoritesQuery());
export const useShoutcastOnlineStations = (genreId: number) => useQuery(shoutcastOnlineStationsQuery(genreId));
export const useCurrentPlaying = (shoutcastStationUrl: string) =>
  useQuery(shoutcastCurrentPlayingQuery(shoutcastStationUrl));
