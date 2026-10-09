import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useIndexerStatus } from '@/features/admin/indexer-status';

export function IndexerToggle({
  className,
  ...rest
}: { className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { isEnabled, isLoadingStatus, toggleStatus } = useIndexerStatus();

  if (isLoadingStatus) {
    return (
      <div className={`flex flex-row space-x-2 ${className ?? ''}`} {...rest}>
        <Switch role="button" aria-label="Toggle indexer" checked={false} disabled />
        <Label>Loading indexer status...</Label>
      </div>
    );
  }

  const handleSubmit = async (value: boolean) => {
    await toggleStatus(value);
  };

  return (
    <div className={`flex flex-row space-x-2 ${className ?? ''}`} {...rest}>
      <Switch
        role="button"
        aria-label="Toggle indexer"
        checked={isEnabled}
        onCheckedChange={(value) => handleSubmit(value)}
      />
      <Label>Indexer is {isEnabled ? 'active' : 'disabled'}</Label>
    </div>
  );
}
