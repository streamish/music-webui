import {
  Album,
  CalendarClock,
  Folder,
  List,
  LogOut,
  type LucideIcon,
  Moon,
  Music,
  Radio,
  Settings,
  Tags,
  User,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DarkModeSwitch } from '@/features/dark-mode-switch';
import { NavLink } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { usePreferences } from '@/hooks/use-preferences';
import type { NavigationLink } from '@/types/navigation-link';

type NavigationLabel = NavigationLink | 'Admin' | 'Account' | 'Sign out';

type NavigationItem = {
  to: string;
  label: NavigationLabel;
  icon: LucideIcon;
};

export const primaryLinks: NavigationItem[] = [
  {
    to: '/',
    label: 'Recently Added',
    icon: CalendarClock,
  },
  {
    to: '/playlists',
    label: 'Playlists',
    icon: List,
  },
  {
    to: '/albums',
    label: 'Albums',
    icon: Album,
  },
  {
    to: '/album-artists',
    label: 'Album Artists',
    icon: Users,
  },
  {
    to: '/track-artists',
    label: 'Artists',
    icon: User,
  },
  {
    to: '/track-composers',
    label: 'Composers',
    icon: Music,
  },
  {
    to: '/track-genres',
    label: 'Genres',
    icon: Tags,
  },
  {
    to: '/folders',
    label: 'Folders',
    icon: Folder,
  },
  {
    to: '/tracks',
    label: 'Tracks',
    icon: Music,
  },
  {
    to: '/shoutcast',
    label: 'Shoutcast Radio',
    icon: Radio,
  },
];

export const secondaryLinks: NavigationItem[] = [
  {
    to: '/admin',
    label: 'Admin',
    icon: Settings,
  },
  {
    to: '/account',
    label: 'Account',
    icon: User,
  },
  {
    to: '/signout',
    label: 'Sign out',
    icon: LogOut,
  },
];

export const MenuButton = ({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: NavigationLabel;
  icon: LucideIcon;
  onClick: () => void;
}) => (
  <SidebarMenuButton className="my-1">
    <NavLink
      to={to}
      aria-label={label}
      onClick={onClick}
      className={({ isActive }) => `my-1 w-full flex flex-row items-center gap-2 ${isActive ? 'font-semibold' : ''}`}
    >
      <Icon />
      <span>{label}</span>
    </NavLink>
  </SidebarMenuButton>
);

export function AppSidebar() {
  const { preferences } = usePreferences();
  const { setOpenMobile } = useSidebar();
  const { isMobile } = useIsMobile();

  const closeMobileSidebar = () => {
    setOpenMobile(false);
  };

  const showLink = (label: NavigationLabel) => {
    return (
      preferences.navigation[label as NavigationLink] === true ||
      preferences.navigation[label as NavigationLink] === undefined
    );
  };

  let imageUrl = '/images/logo.png';
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    imageUrl = '/images/logo-dark.png';
  }

  return (
    <Sidebar className="border-transparent border-r border-r-muted-foreground/25">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2 cursor-default" onClick={closeMobileSidebar}>
          <div>
            <img src={imageUrl} className="w-12 h-12" />
          </div>
          <span className="font-semibold">Music Player</span>
          {isMobile && (
            <Button
              variant="ghost"
              onClick={closeMobileSidebar}
              aria-label="Close Sidebar"
              className="ml-auto cursor-pointer"
            >
              <X />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryLinks
                .filter(({ label }) => showLink(label))
                .map(({ to, label, icon: Icon }) => (
                  <MenuButton to={to} label={label} icon={Icon} onClick={closeMobileSidebar} key={label} />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-26">
        <SidebarMenu>
          <MenuButton to="/account" label="Account" icon={User} onClick={closeMobileSidebar} />
          <MenuButton to="/admin" label="Admin" icon={Settings} onClick={closeMobileSidebar} />
          <MenuButton to="/signout" label="Sign out" icon={LogOut} onClick={closeMobileSidebar} />
          <SidebarMenuItem>
            <div className="my-1 ml-3">
              <DarkModeSwitch className="w-full justify-start" aria-label="Toggle dark mode">
                <Moon />
                <span>Toggle theme</span>
              </DarkModeSwitch>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
