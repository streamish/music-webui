type PlaylistCoverImageProps = {
  playlistId: number;
  playlistName: string;
  size: number;
  className?: string;
};

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function PlaylistCoverImage({ playlistId, playlistName, size, className }: PlaylistCoverImageProps) {
  return (
    <img
      className={`animate-[fade-in_300ms_ease-out] object-cover ${className ?? ''}`}
      src={`${baseUrl}/api/playlist-cover-image?id=${playlistId}&size=${size}`}
      alt={`Cover for playlist ${playlistName}`}
      loading="lazy"
    />
  );
}
