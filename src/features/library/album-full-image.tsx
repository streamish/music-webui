type AlbumImageProps = {
  albumId: number;
  size: number;
  className?: string;
  ariaHidden?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function AlbumFullImage({ albumId, size, className, ariaHidden, style }: AlbumImageProps) {
  return (
    <img
      className={`animate-[fade-in_300ms_ease-out] ${className ?? ''}`}
      src={`${baseUrl}/api/album-cover-image?id=${albumId}&size=${size}`}
      alt={`Album cover for album ID ${albumId}`}
      {...(ariaHidden ? { 'aria-hidden': 'true' } : {})}
      style={style}
    />
  );
}
