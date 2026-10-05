import { DataCard, DataCardContent, DataCardFooter, DataCardSubtitle, DataCardTitle } from '@/components/data-card';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '../../components/data-table';
import { RootPathDeleteForm } from './root-path-delete-form';
import { Separator } from '@/components/ui/separator';
import { formatNumber, formatSize } from '@/utils/format';
import { memo } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useRootPaths } from '@/hooks/user/use-root-paths';

export const RootPathTable = memo(() => {
  const { rootPaths, isLoading } = useRootPaths();
  const { isMobile } = useIsMobile();

  const cellFiller = (opacity: number) => <span className={`bg-foreground/${opacity} h-8 w-full block`} />;
  const dummyRows = [
    {
      id: -1,
      rootPath: '',
      fileCount: -1,
      totalSize: -1,
      createdAt: '',
      username: '',
    },
    {
      id: -2,
      rootPath: '',
      fileCount: -2,
      totalSize: -2,
      createdAt: '',
      username: '',
    },
    {
      id: -3,
      rootPath: '',
      fileCount: -3,
      totalSize: -3,
      createdAt: '',
      username: '',
    },
  ];

  return (
    <>
      {/* Mobile card view */}
      {isMobile && (
        <div role="list" aria-label="Root paths">
          {(isLoading ? dummyRows : rootPaths).map((rootPath) => {
            const ariaLabel = `Root path for ${rootPath.rootPath || 'loading'}`;
            return (
              <DataCard key={`card-${rootPath.id}`} role="row" aria-label={ariaLabel} className="mb-4">
                <DataCardTitle>{rootPath.rootPath}</DataCardTitle>
                <DataCardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <DataCardSubtitle>Files</DataCardSubtitle>
                      <p className="text-sm">{formatNumber(rootPath.fileCount)}</p>
                    </div>
                    <div>
                      <DataCardSubtitle>Size</DataCardSubtitle>
                      <p className="text-sm">{formatSize(rootPath.totalSize)}</p>
                    </div>
                  </div>
                </DataCardContent>
                <Separator />
                <DataCardFooter>
                  <RootPathDeleteForm rootPath={rootPath} />
                </DataCardFooter>
              </DataCard>
            );
          })}
        </div>
      )}
      {/* Desktop table view */}
      {!isMobile && (
        <DataTable role="table" aria-label="Root paths">
          <DataTableHeader>
            <DataTableHeaderCell className="w-100">Path</DataTableHeaderCell>
            <DataTableHeaderCell className="w-25">Files</DataTableHeaderCell>
            <DataTableHeaderCell className="w-25">Size</DataTableHeaderCell>
            <DataTableHeaderCell>Actions</DataTableHeaderCell>
          </DataTableHeader>
          <DataTableBody>
            {(isLoading ? dummyRows : rootPaths).map((rootPath, index) => {
              const opacity = index % 2 === 0 ? 20 : 10;
              const ariaLabel = `Root path for ${rootPath.rootPath || 'loading'}`;
              return (
                <DataTableRow key={`row-${rootPath.id}`} role="row" aria-label={ariaLabel}>
                  <DataTableCell>{rootPath.rootPath || cellFiller(opacity)}</DataTableCell>
                  <DataTableCell>
                    {rootPath.fileCount > -1 ? formatNumber(rootPath.fileCount) : cellFiller(opacity)}
                  </DataTableCell>
                  <DataTableCell>
                    {rootPath.totalSize > 1 ? formatSize(rootPath.totalSize) : cellFiller(opacity)}
                  </DataTableCell>
                  <DataTableCell>
                    {rootPath.id > 0 ? (
                      <div className="flex gap-2 whitespace-nowrap">
                        <RootPathDeleteForm rootPath={rootPath} />
                      </div>
                    ) : (
                      cellFiller(opacity)
                    )}
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      )}
    </>
  );
});
