import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatNumber } from '@/utils/format';
import { usePreferences } from '@/hooks/use-preferences';
import type { NavigationLink } from '@/types/navigation-link';

export default function UiPreferences() {
  const { preferences, toggleItemVisibility, setPageSize } = usePreferences();
  const preferenceNames: NavigationLink[] = [
    'Albums',
    'Album Artists',
    'Artists',
    'Genres',
    'Composers',
    'Folders',
    'Tracks',
  ] as const;

  return (
    <>
      <h3 className="text-sm mb-2">Navigation</h3>
      <div className="mb-4">
        {preferenceNames.map((name) => (
          <div key={name} className="flex items-center space-x-2 mb-2">
            <Checkbox
              id={name}
              checked={preferences.navigation[name]}
              onCheckedChange={(checked) => toggleItemVisibility(name, checked === true)}
            />
            <Label htmlFor={name}>{name}</Label>
          </div>
        ))}
      </div>
      <h3 className="text-sm mb-2">Pagination</h3>
      <RadioGroup
        value={String(preferences.pageSize)}
        onValueChange={(value) => setPageSize(Number.parseInt(value, 10))}
        className="w-fit grid-cols-none -grid"
      >
        {[100, 200, 500, 1000, 2000, 10000, 0].map((value) => (
          <div key={value} className="inline-flex items-center space-x-2 mr-4">
            <RadioGroupItem id={`pagination-${value}`} value={String(value)} />
            <Label htmlFor={`pagination-${value}`}>{value ? formatNumber(value) : 'ALL'}</Label>
          </div>
        ))}
      </RadioGroup>
    </>
  );
}
