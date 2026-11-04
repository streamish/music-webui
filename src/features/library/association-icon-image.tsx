import { useEffect, useRef, useState } from 'react';

type ArtistImageProps = {
  associationId: number;
  size: number;
} & React.HTMLAttributes<HTMLDivElement>;

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function AssociationIconImage({ associationId, size, style, ...props }: ArtistImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Detect whether the image is near the viewport.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
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
    // eslint-disable-next-line consistent-return
    return () => {
      observer.disconnect();
    };
  }, []);

  // Fetch while visible and unload while not visible.
  useEffect(() => {
    if (!isVisible) {
      if (objectUrlRef.current) {
        objectUrlRef.current = null;
      }
      return undefined;
    }
    const nextUrl = `${baseUrl}/api/association-cover-image?id=${associationId}&size=${size}`;
    objectUrlRef.current = nextUrl;
    return () => {
      if (objectUrlRef.current) {
        objectUrlRef.current = null;
      }
    };
  }, [associationId, size, isVisible]);

  return (
    <div ref={containerRef} {...props} className={props.className}>
      {isVisible && (
        <img
          src={`${baseUrl}/api/association-cover-image?id=${associationId}&size=${size}`}
          alt=""
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
