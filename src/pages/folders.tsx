import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { FavoriteControls } from '@/features/library/favorite-controls';
import { FolderIcon } from 'lucide-react';
import { Fragment, useCallback, useRef } from 'react';
import { IconCard } from '@/components/icon-card';
import { TrackTable } from '@/features/library/track-table';
import { TreeListItem } from '@/features/library/folder-list-item';
import { useFolders } from '@/features/library/api/folders';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams } from 'react-router';
import type { components } from '@/types/api-schema';

type Folder = components['schemas']['LibraryFolderDto'];
type Track = components['schemas']['LibraryTrackDto'];

function findBreadCrumb(id: number, items: Folder[], path: Folder[] = []): Folder[] | null {
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.folder) {
      if (item.id === id) {
        return [...path, item];
      }
      if (item.children) {
        const foundNestedItemPath = findBreadCrumb(id, item.children, [...path, item]);
        if (foundNestedItemPath) {
          return foundNestedItemPath;
        }
      }
    }
  }
  return null;
}

export default function FoldersPage() {
  const navigate = useNavigate();
  const { folderId, '*': folderSlug } = useParams<{ folderId: string; '*': string }>();
  const { data: folders = [] } = useFolders(`/${folderSlug || ''}`);
  const { isMobile } = useIsMobile();
  const listRef = useRef(null);
  const expandedItemId = Number(folderId) ?? null;
  const breadcrumb = expandedItemId ? findBreadCrumb(expandedItemId, folders) || [] : [];
  const expandedItem = expandedItemId ? breadcrumb[breadcrumb.length - 1] : null;
  const items = expandedItem?.children || folders || [];

  breadcrumb.unshift({
    id: 0,
    folder: 'Root paths',
    fullPath: '/',
    relativePath: '/',
    children: folders ?? [],
  });

  const toggleFolder = useCallback(
    (item: Folder) => {
      if (expandedItemId === item.id || item.id === 0) {
        navigate('/folders');
      } else {
        navigate(`/folders/${item.id}/${item.relativePath}`);
      }
    },
    [expandedItemId, navigate],
  );

  const clickCrumb = useCallback(
    (item: Folder) => {
      if (item.id === 0) {
        navigate('/folders');
      } else {
        navigate(`/folders/${item.id}/${item.relativePath}`);
      }
    },
    [navigate],
  );

  const tracks: Track[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.track) {
      tracks.push(item.track);
    }
  }

  return (
    <>
      <title>Folders</title>
      <Breadcrumb className="p-4">
        <BreadcrumbList className="gap-0 sm:gap-0">
          {breadcrumb.map((crumb, index) => {
            return (
              <Fragment key={`breadcrumb-${index}`}>
                <BreadcrumbItem className="gap-0">
                  <BreadcrumbLink
                    onClick={() => clickCrumb(crumb)}
                    aria-label={`Breadcrumb: ${crumb.folder}`}
                    className="text-xs py-0 px-2 cursor-pointer"
                  >
                    {crumb.folder}
                  </BreadcrumbLink>
                  {index === breadcrumb.length - 1 && <FavoriteControls folder={crumb} />}
                </BreadcrumbItem>
                {index < breadcrumb.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="overflow-y-scroll h-[calc(100vh-9rem)] pb-20">
        {isMobile && (
          <ul className="flex flex-col grow" aria-label="Folder list">
            {items.length > 0 &&
              items
                .filter((item: Folder) => item.folder)
                .map((item: Folder, index) => {
                  return (
                    <li
                      className="w-full p-2"
                      key={`mobile-album ${item.fullPath}`}
                      aria-label={`Track item ${index + 1}`}
                    >
                      <TreeListItem item={item} onToggle={() => toggleFolder(item)} />
                    </li>
                  );
                })}
          </ul>
        )}
        {!isMobile && (
          <ul
            ref={listRef}
            className={[
              'grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]',
              'md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]',
              'lg:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] ',
              'gap-4 mx-4',
            ].join(' ')}
            aria-label="Folder list"
          >
            {items
              .filter((item: Folder) => item.folder)
              .map((item: Folder) => {
                return (
                  <li className="w-full h-full inline-flex align-middle justify-center" key={`folder ${item.id}`}>
                    <IconCard
                      text={item.folder || item.file || ''}
                      icon={FolderIcon}
                      onToggle={() => toggleFolder(item)}
                    />
                  </li>
                );
              })}
          </ul>
        )}
        {tracks.length > 0 && (
          <div className="w-full px-4">
            <TrackTable tracks={tracks} />
          </div>
        )}
      </div>
    </>
  );
}
