import { Button } from '@/components/ui/button';
import { DataCard, DataCardContent, DataCardSubtitle, DataCardTitle } from '@/components/data-card';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components';
import { DownloadIcon, LogsIcon, RefreshCcwIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDateToRelative } from '@/utils/format';
import { memo } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useQuery } from 'node_modules/@tanstack/react-query/build/modern/useQuery';
import api from '@/lib/api';

function useListIndexerLogs() {
  return useQuery({
    queryKey: ['admin', 'indexer-logs'],
    queryFn: async () => {
      const { data, error } = await api.get('/api/user/list-indexer-logs');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No indexer logs returned');
      }
      return data.logs;
    },
  });
}

export const IndexerLogsTable = memo(() => {
  const { data: indexerLogs = [], isLoading: indexerLogsLoading, refetch: listIndexerLogs } = useListIndexerLogs();
  const { isMobile } = useIsMobile();

  const handleRefresh = async () => {
    await listIndexerLogs();
  };

  const handleViewRaw = async () => {
    let maximumDateLength = 0;
    let maximumPathLength = 0;
    indexerLogs.reverse().forEach((item) => {
      const dateLength = item.date.toString().length;
      const pathLength = (item.rootPath || '-').length;
      if (dateLength > maximumDateLength) {
        maximumDateLength = dateLength;
      }
      if (pathLength > maximumPathLength) {
        maximumPathLength = pathLength;
      }
    });
    const headings = [`Date`.padEnd(maximumDateLength, ' '), `Path`.padEnd(maximumPathLength, ' '), `Message`];
    const csv = `${headings.join('    ')}\n${indexerLogs
      .map((item) => {
        const values = [
          item.date.toString().padEnd(maximumDateLength),
          (item.rootPath || '-').padEnd(maximumPathLength),
          item.message,
        ];
        return values.join('    ');
      })
      .join('\n')}`;
    const blob = new Blob([csv], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const text = JSON.stringify(indexerLogs, null, 2);
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `music-server-logs-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headings = [`Date`, `User`, `Path`, `Message`];
    const csv = `${headings.join(',')}\n${indexerLogs
      .map((item) => {
        const values = [item.date.toString(), '-', item.rootPath || '-', item.message];
        return values.join(',');
      })
      .join('\n')}`;
    const blob = new Blob([csv], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `music-server-logs-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const cellFiller = (opacity: number) => <span className={`bg-foreground/${opacity} h-8 w-full block`} />;
  const dummyRows = [
    {
      date: '',
      username: '',
      rootPath: '',
      message: '',
    },
    {
      date: '',
      username: '',
      rootPath: '',
      message: '',
    },
    {
      date: '',
      username: '',
      rootPath: '',
      message: '',
    },
  ];

  const dateInformation = (dateString: string) => {
    const date = new Date(Date.parse(dateString));
    return <span title={date.toLocaleString()}>{formatDateToRelative(date)}</span>;
  };

  return (
    <>
      {indexerLogsLoading ? (
        <Button className="mr-2 mb-4" variant="outline" disabled>
          <RefreshCcwIcon className="animate-spin" />
          Loading
        </Button>
      ) : (
        <Button className="mr-2 mb-4" variant="outline" onClick={handleRefresh}>
          <RefreshCcwIcon />
          Refresh
        </Button>
      )}
      <Button role="button" aria-label="View raw logs" className="mr-2 mb-4" variant="outline" onClick={handleViewRaw}>
        <LogsIcon />
        View
      </Button>
      <Button
        role="button"
        aria-label="Download logs as JSON"
        className="mr-2 mb-4"
        variant="outline"
        onClick={handleDownloadJson}
      >
        <DownloadIcon />
        JSON
      </Button>
      <Button
        role="button"
        aria-label="Download logs as CSV"
        className="mb-2"
        variant="outline"
        onClick={handleDownloadCsv}
      >
        <DownloadIcon />
        CSV
      </Button>
      {/* Mobile card view */}
      {isMobile && (
        <>
          {(indexerLogsLoading ? dummyRows : indexerLogs).map((log, index) => {
            const opacity = index % 2 === 0 ? 20 : 10;
            return (
              <DataCard key={`card-${index}`} className="mb-4">
                <DataCardTitle>{log.date ? dateInformation(log.date) : cellFiller(opacity)}</DataCardTitle>
                <DataCardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <DataCardSubtitle>Root path</DataCardSubtitle>
                      <p className="text-sm">{log.rootPath || (log.rootPath === '' ? cellFiller(opacity) : '-')}</p>
                    </div>
                  </div>
                  <p className="text-sm">{log.message.replace(log.rootPath, '') || cellFiller(opacity)}</p>
                </DataCardContent>
                <Separator />
              </DataCard>
            );
          })}
        </>
      )}

      {/* Desktop table view */}
      {!isMobile && (
        <DataTable>
          <DataTableHeader>
            <DataTableHeaderCell className="w-50">Date</DataTableHeaderCell>
            <DataTableHeaderCell className="w-100">Root path</DataTableHeaderCell>
            <DataTableHeaderCell>Message</DataTableHeaderCell>
          </DataTableHeader>
          <DataTableBody>
            {(indexerLogsLoading ? dummyRows : indexerLogs).map((log, index) => {
              const opacity = index % 2 === 0 ? 20 : 10;
              return (
                <DataTableRow key={`row-${index}`}>
                  <DataTableCell className="text-foreground/50 text-xs">
                    {log.date ? dateInformation(log.date) : cellFiller(opacity)}
                  </DataTableCell>
                  <DataTableCell className="text-foreground/70 text-xs">
                    {log.rootPath || (log.rootPath === '' ? cellFiller(opacity) : '-')}
                  </DataTableCell>
                  <DataTableCell className="text-foreground/70 text-xs">
                    {log.message.replace(log.rootPath, '') || cellFiller(opacity)}
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
