import { Fragment, useCallback, useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { usePreferences } from '@/hooks/use-preferences';

type PaginationControlsProps = {
  page: number;
  items: number;
  setPage: (nextPage: number) => void;
};

export function PaginationControls({ page, items, setPage }: PaginationControlsProps) {
  const { preferences } = usePreferences();
  const { pageSize } = preferences;
  const pageCount = Math.max(1, Math.ceil(items / pageSize));

  const pageNumbers = useMemo(() => {
    const pages = new Set([1, page - 1, page, page + 1, pageCount]);
    return [...pages].filter((pageNumber) => pageNumber >= 1 && pageNumber <= pageCount).sort((a, b) => a - b);
  }, [page, pageCount]);

  const goToPage = useCallback((nextPage: number) => setPage(nextPage), [setPage]);

  if (pageCount <= 1) {
    return null;
  }
  const isFirstPage = page === 1;
  const isLastPage = page === pageCount;

  return (
    <div className="my-10">
      <Pagination aria-label="Pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={isFirstPage}
              tabIndex={isFirstPage ? -1 : undefined}
              className={isFirstPage ? 'pointer-events-none opacity-50' : undefined}
              onClick={(event) => {
                event.preventDefault();
                if (!isFirstPage) {
                  goToPage(page - 1);
                }
              }}
            />
          </PaginationItem>
          {pageNumbers.map((pageNumber, index) => {
            const previousPage = pageNumbers[index - 1];
            const hasGap = previousPage !== undefined && pageNumber - previousPage > 1;
            return (
              <Fragment key={pageNumber}>
                {hasGap && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      if (pageNumber !== page) {
                        goToPage(pageNumber);
                      }
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              </Fragment>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={isLastPage}
              tabIndex={isLastPage ? -1 : undefined}
              className={isLastPage ? 'pointer-events-none opacity-50' : undefined}
              onClick={(event) => {
                event.preventDefault();
                if (!isLastPage) {
                  goToPage(page + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
