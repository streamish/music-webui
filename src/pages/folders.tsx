import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment, useRef } from 'react';
import { Music } from 'lucide-react';
import { PlaybackControls } from '@/components/playback-controls';
import { TreeCard } from '@/components/tree-card';
import { type TreeItemDto, useFolders } from '@/hooks/user/use-folders';
import { TreeListItem } from '@/components/tree-list-item';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useNavigate, useParams } from 'react-router-dom';

function findBreadCrumb(id: number, items: TreeItemDto[], path: TreeItemDto[] = []): TreeItemDto[] | null {
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
  const { folders, refetchFolders } = useFolders();
  const isMobile = useIsMobile();
  const listRef = useRef(null);
  const { folderId } = useParams<{ folderId: string }>();
  const expandedItemId = Number(folderId) ?? null;
  const breadcrumb = expandedItemId ? findBreadCrumb(expandedItemId, folders ?? []) || [] : [];
  const expandedItem = expandedItemId ? breadcrumb[breadcrumb.length - 1] : null;
  const items = expandedItem?.children || folders || [];

  if (breadcrumb.length) {
    breadcrumb.unshift({
      id: 0,
      folder: 'Root paths',
      fullPath: '',
      children: folders ?? [],
    });
  }

  function toggleFolder(item: TreeItemDto) {
    if (expandedItemId === item.id || item.id === 0) {
      navigate('/folders');
    } else {
      navigate(`/folders/${item.id}/${item.fullPath}`);
    }
  }

  function clickCrumb(item: TreeItemDto) {
    if (item.id === 0) {
      navigate('/folders');
    } else {
      navigate(`/folders/${item.id}/${item.fullPath}`);
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
                </BreadcrumbItem>
                {index < breadcrumb.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {isMobile && (
        <ul className="flex flex-col grow" aria-label="Folder list">
          {items.length > 0 &&
            items.map((item: TreeItemDto) => {
              return (
                <li className="w-full p-2" key={`mobile-album ${item.fullPath}`}>
                  <TreeListItem item={item} onToggle={() => toggleFolder(item)} onEdit={refetchFolders} />
                </li>
              );
            })}
        </ul>
      )}
      {!isMobile && (
        <>
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
              .filter((item: TreeItemDto) => item.folder)
              .map((item) => {
                return (
                  <li className="w-full h-full inline-flex align-middle justify-center" key={`folder ${item.id}`}>
                    <TreeCard item={item} onToggle={() => toggleFolder(item)} />
                  </li>
                );
              })}
          </ul>
          <ol className="p-4">
            {items
              .filter((item: TreeItemDto) => item.file)
              .map((item: TreeItemDto, index) => {
                const { track } = item;
                if (!track) return null;
                return (
                  <li
                    key={track.id}
                    className="align-middle flex justify-between border-dotted border-b border-foreground/25"
                    aria-label={`Track item ${index + 1}`}
                  >
                    <div>
                      <Music
                        className="inline-block w-4 h-4 lg:w-6 lg:h-6 mr-2"
                        strokeWidth={1}
                        absoluteStrokeWidth={true}
                        opacity={0.5}
                      />
                      <span className="py-1.5 align-middle text-sm text-foreground/90">{track.filePath}</span>
                    </div>
                    <div>
                      <PlaybackControls tracks={[track]} onEdit={refetchFolders} />
                    </div>
                  </li>
                );
              })}
          </ol>
        </>
      )}
    </>
  );
}
