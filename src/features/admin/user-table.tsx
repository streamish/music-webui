import { Badge } from '@/components/ui/badge';
import { DataCard, DataCardContent, DataCardFooter, DataCardSubtitle, DataCardTitle } from '@/components/data-card';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '../../components/data-table';
import { Separator } from '@/components/ui/separator';
import { UserDeleteForm } from './user-delete-form';
import { UserResetPasswordForm } from './user-reset-password-form';
import { UserRotateSessionKeyForm } from './user-rotate-session-key-form';
import { UserUpdateRolesForm } from './user-update-roles-form';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useQuery } from 'node_modules/@tanstack/react-query/build/modern/useQuery';
import api from '@/lib/api';

function useListAccounts() {
  return useQuery({
    queryKey: ['admin', 'user-accounts'],
    queryFn: async () => {
      const { data, error } = await api.get('/api/admin/list-accounts');
      if (error) {
        throw new Error(error.error);
      }
      if (!data) {
        throw new Error('No user accounts returned');
      }
      return data.accounts;
    },
  });
}

export function UserTable() {
  const { data: accounts = [], isLoading, refetch: refetchAccounts } = useListAccounts();
  const { isMobile } = useIsMobile();

  const cellFiller = (opacity: number) => <span className={`bg-foreground/${opacity} h-8 w-full block`} />;
  const dummyRows = [
    {
      id: -1,
      accountId: -1,
      roles: [],
      username: '',
    },
    {
      id: -2,
      accountId: -2,
      roles: [],
      username: '',
    },
    {
      id: -3,
      accountId: -3,
      roles: [],
      username: '',
    },
  ];

  return (
    <>
      {/* Mobile card view */}
      {isMobile && (
        <div role="list" aria-label="User accounts">
          {(isLoading ? dummyRows : accounts).map((account, index) => {
            const opacity = index % 2 === 0 ? 20 : 10;
            return (
              <DataCard
                key={`card-${account.id}`}
                role="row"
                aria-label={`User account ${account.username || 'loading'}`}
                className="mb-4"
              >
                <DataCardTitle>{account.username || cellFiller(opacity)}</DataCardTitle>
                <DataCardContent>
                  <DataCardSubtitle>Role(s)</DataCardSubtitle>
                  {account.roles.length ? (
                    <div className="flex flex-wrap gap-2">
                      {account.roles.map((role) => (
                        <Badge variant={role === 'admin' ? 'destructive' : 'secondary'} key={`${account.id}-${role}`}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    cellFiller(opacity)
                  )}
                </DataCardContent>
                <Separator />
                <DataCardFooter>
                  {account.id > 0 ? (
                    <>
                      <UserRotateSessionKeyForm user={account} />
                      <UserUpdateRolesForm user={account} onSave={() => refetchAccounts()} />
                      <UserResetPasswordForm user={account} />
                      <UserDeleteForm user={account} />
                    </>
                  ) : (
                    cellFiller(opacity)
                  )}
                </DataCardFooter>
              </DataCard>
            );
          })}
        </div>
      )}

      {/* Desktop table view */}
      {!isMobile && (
        <DataTable role="table" aria-label="User accounts">
          <DataTableHeader>
            <DataTableHeaderCell className="w-50">Username</DataTableHeaderCell>
            <DataTableHeaderCell className="w-50">Role(s)</DataTableHeaderCell>
            <DataTableHeaderCell>Actions</DataTableHeaderCell>
          </DataTableHeader>
          <DataTableBody>
            {(isLoading ? dummyRows : accounts).map((account, index) => {
              const opacity = index % 2 === 0 ? 20 : 10;
              return (
                <DataTableRow
                  key={`row-${account.id}`}
                  role="row"
                  aria-label={`User account ${account.username || 'loading'}`}
                >
                  <DataTableCell>{account.username || cellFiller(opacity)}</DataTableCell>
                  <DataTableCell>
                    {account.roles.length
                      ? account.roles.map((role) => (
                          <Badge
                            variant={role === 'admin' ? 'destructive' : 'secondary'}
                            key={`${account.id}-${role}`}
                            className="mr-4"
                          >
                            {role}
                          </Badge>
                        ))
                      : cellFiller(opacity)}
                  </DataTableCell>
                  <DataTableCell>
                    {account.id > 0 ? (
                      <div className="flex gap-2 whitespace-nowrap">
                        <UserRotateSessionKeyForm user={account} className="mr-4" />
                        <UserUpdateRolesForm user={account} onSave={() => refetchAccounts()} className="mr-4" />
                        <UserResetPasswordForm user={account} className="mr-4" />
                        <UserDeleteForm user={account} className="mr-4" />
                      </div>
                    ) : (
                      cellFiller(opacity)
                    )}
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      )}
    </>
  );
}
