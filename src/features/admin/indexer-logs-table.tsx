import { Button } from '@/components/ui/button';
import { DownloadIcon, LogsIcon } from 'lucide-react';
import { memo } from 'react';
import { useIndexer } from '@/hooks/admin/use-indexer';

export const IndexerLogsTable = memo(() => {
  const { indexerLogs } = useIndexer();

  const handleViewRaw = async () => {
    let maximumDateLength = 0;
    let maximumUsernameLength = 0;
    let maximumPathLength = 0;
    indexerLogs.reverse().forEach((item) => {
      const dateLength = item.date.toString().length;
      const usernameLength = (item.username || '-').length;
      const pathLength = (item.rootPath || '-').length;
      if (dateLength > maximumDateLength) {
        maximumDateLength = dateLength;
      }
      if (usernameLength > maximumUsernameLength) {
        maximumUsernameLength = usernameLength;
      }
      if (pathLength > maximumPathLength) {
        maximumPathLength = pathLength;
      }
    });
    const headings = [
      `Date`.padEnd(maximumDateLength, ' '),
      `User`.padEnd(maximumUsernameLength, ' '),
      `Path`.padEnd(maximumPathLength, ' '),
      `Message`,
    ];
    const csv = `${headings.join('    ')}\n${indexerLogs
      .map((item) => {
        const values = [
          item.date.toString().padEnd(maximumDateLength),
          (item.username || '-').padEnd(maximumUsernameLength, ' '),
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
        const values = [item.date.toString(), item.username || '-', item.rootPath || '-', item.message];
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

  return (
    <>
      <Button
        role="button"
        aria-label="View raw logs"
        className=" text-xs mr-2 mb-4 uppercase"
        variant="outline"
        onClick={handleViewRaw}
      >
        <LogsIcon />
        View Indexer logs
      </Button>
      <Button
        role="button"
        aria-label="Download logs as JSON"
        className=" text-xs mr-2 mb-4 uppercase"
        variant="outline"
        onClick={handleDownloadJson}
      >
        <DownloadIcon />
        JSON
      </Button>
      <Button
        role="button"
        aria-label="Download logs as CSV"
        className=" text-xs mb-2 uppercase"
        variant="outline"
        onClick={handleDownloadCsv}
      >
        <DownloadIcon />
        CSV
      </Button>
    </>
  );
});
