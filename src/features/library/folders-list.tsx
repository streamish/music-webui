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
import { type TreeItemDto, useLibrary } from './library';
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

export default function FoldersList() {
  const navigate = useNavigate();
  const { folders } = useLibrary();
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
                  <BreadcrumbLink onClick={() => clickCrumb(crumb)} className="text-xs py-0 px-2 cursor-pointer">
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
        <ul className="flex flex-col grow">
          {items.length > 0 &&
            items.map((item) => {
              return (
                <li className="w-full p-2" key={`mobile-album ${item.fullPath}`}>
                  <TreeListItem item={item} onToggle={() => toggleFolder(item)} />
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
          >
            {items
              .filter((item) => item.folder)
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
              .filter((item) => item.file)
              .map((item) => {
                return (
                  <li
                    key={`filler-${item.id}`}
                    className="align-middle flex justify-between border-dotted border-b border-foreground/25"
                  >
                    <div>
                      <Music
                        className="inline-block w-4 h-4 lg:w-6 lg:h-6 mr-2"
                        strokeWidth={1}
                        absoluteStrokeWidth={true}
                        opacity={0.5}
                        aria-label={`${item.fullPath}`}
                      />
                      <span className="py-1.5 align-middle text-sm text-foreground/90">{item.file}</span>
                    </div>
                    <div>
                      <PlaybackControls file={item} />
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
