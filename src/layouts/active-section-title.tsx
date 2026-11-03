import { primaryLinks, secondaryLinks } from '@/features/app-sidebar';
import { useLocation } from 'react-router';

const allNavigationLinks = [...primaryLinks, ...secondaryLinks];

function getActiveNavigationItem(pathname: string) {
  return allNavigationLinks
    .filter(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

// Icon and label of the navigation section matching the current route.
export function ActiveSectionTitle() {
  const { pathname } = useLocation();
  const activeItem = getActiveNavigationItem(pathname);
  const ActiveIcon = activeItem?.icon;
  if (!activeItem || !ActiveIcon) {
    return null;
  }
  return (
    <div className="w-full h-full flex flex-row">
      <div className="h-5 my-4.5 w-px border-r border-r-muted-foreground/50" />
      <div className="ml-5 flex items-center gap-2 text-sm font-medium">
        <ActiveIcon className="size-4 text-muted-foreground" />
        <span>{activeItem.label}</span>
      </div>
    </div>
  );
}
