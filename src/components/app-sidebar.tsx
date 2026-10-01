import { Album, Folder, LogOut, type LucideIcon, Moon, Music, Settings, Tags, User, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

import { DarkModeSwitch } from '@/features/dark-mode-switch';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePreferences } from '@/hooks/use-preferences';
import type { PreferenceNavigationLink } from '@/hooks/use-preferences';

type NavigationLabel = PreferenceNavigationLink | 'Admin' | 'Account' | 'Sign out';

type NavigationItem = {
  to: string;
  label: NavigationLabel;
  icon: LucideIcon;
};

export const primaryLinks: NavigationItem[] = [
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

export function AppSidebar() {
  const { preferences } = usePreferences();
  const { setOpenMobile } = useSidebar();

  const closeMobileSidebar = () => {
    setOpenMobile(false);
  };

  const showLink = (label: NavigationLabel) => {
    return preferences.navigation[label as PreferenceNavigationLink];
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2 cursor-default" onClick={closeMobileSidebar}>
          <div>
            <img src="/public/images/logo.png" className="w-12 h-12" />
          </div>
          <span className="font-semibold">Music Player</span>
          <Button
            variant="ghost"
            onClick={closeMobileSidebar}
            aria-label="Close Sidebar"
            className="ml-auto cursor-pointer"
          >
            <X />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryLinks
                .filter(({ label }) => showLink(label))
                .map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild tooltip={label}>
                      <NavLink
                        to={to}
                        aria-label={label}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) => (isActive ? 'bg-primary/20 font-semibold' : '')}
                      >
                        <Icon />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-26">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/account" aria-label="Account" onClick={closeMobileSidebar}>
                <User />
                <span>Account</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/admin" aria-label="Admin" onClick={closeMobileSidebar}>
                <Settings />
                <span>Admin</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/signout" aria-label="Sign out" onClick={closeMobileSidebar}>
                <LogOut />
                <span>Sign out</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <DarkModeSwitch className="w-full justify-start" aria-label="Toggle dark mode">
                <Moon />
                <span>Toggle theme</span>
              </DarkModeSwitch>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
