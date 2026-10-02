import { useCallback, useLayoutEffect, useState } from 'react';

export function useGridColumnCount() {
  const [listElement, setListElement] = useState<HTMLElement | null>(null);
  const [columnCount, setColumnCount] = useState(0);

  const listRef = useCallback((element: HTMLElement | null) => {
    setListElement(element);
  }, []);

  const measureColumns = useCallback(() => {
    if (!listElement) {
      return;
    }
    const items = Array.from(listElement.children) as HTMLElement[];
    if (items.length === 0) {
      return;
    }
    const firstItem = items[0];
    const firstRowTop = firstItem.offsetTop;
    let columns = 1;
    for (let i = 1; i < items.length; i += 1) {
      const item = items[i];
      if (item.offsetTop !== firstRowTop) {
        break;
      }
      columns += 1;
    }
    setColumnCount((previous) => (previous === columns ? previous : columns));
  }, [listElement]);

  useLayoutEffect(() => {
    if (!listElement) {
      return undefined;
    }
    let frameId: number | undefined;
    const scheduleMeasurement = () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        measureColumns();
      });
    };
    const resizeObserver = new ResizeObserver(scheduleMeasurement);
    resizeObserver.observe(listElement);
    const mutationObserver = new MutationObserver(scheduleMeasurement);
    mutationObserver.observe(listElement, {
      childList: true,
      subtree: true,
    });
    window.addEventListener('resize', scheduleMeasurement);
    scheduleMeasurement();
    return () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasurement);
    };
  }, [listElement, measureColumns]);

  return {
    listRef,
    columnCount,
    measureColumns,
  };
}
