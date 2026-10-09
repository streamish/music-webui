import { useEffect, useRef, useState } from 'react';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type AlbumImageProps = {
  albumId: number;
  size: number;
} & React.HTMLAttributes<HTMLDivElement>;

export function AlbumIconImage({ albumId, size, style, ...props }: AlbumImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Detect whether the image is near the viewport.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '300px',
      },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Fetch while visible and unload while not visible.
  useEffect(() => {
    if (!isVisible) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setImageUrl(null);
      return undefined;
    }
    const nextUrl = `${baseUrl}/api/user/album-cover-image?id=${albumId}&size=${size}`;
    objectUrlRef.current = nextUrl;
    setImageUrl(nextUrl);
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setImageUrl(null);
    };
  }, [albumId, isVisible]);

  return (
    <div
      ref={containerRef}
      {...props}
      className={`animate-[fade-in_300ms_ease-out] ${props.className ?? ''}`}
      style={{
        ...style,
        backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
