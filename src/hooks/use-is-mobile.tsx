import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;
const EXTRA_SMALL_BREAKPOINT = 390;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches : false,
  );
  const [isExtraSmall, setIsExtraSmall] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${EXTRA_SMALL_BREAKPOINT - 1}px)`).matches : false,
  );

  useEffect(() => {
    function handleResize() {
      const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const extraSmallQuery = window.matchMedia(`(max-width: ${EXTRA_SMALL_BREAKPOINT - 1}px)`);
      setIsMobile(mobileQuery.matches);
      setIsExtraSmall(extraSmallQuery.matches);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile, isExtraSmall };
}
