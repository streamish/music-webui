import { IndexerLogsTable } from '@/features/admin/indexer-logs-table';
import { IndexerToggle } from '@/features/admin/indexer-toggle';
import { RootPathAddForm, RootPathTable } from '@/components';
import { SystemRotateSessionMasterKeyForm } from '@/features/admin/system-rotate-session-master-key-form';
import { UserAddForm } from '@/features/admin/user-add-form';
import { UserTable } from '@/features/admin/user-table';

const AdminHomePage = () => {
  return (
    <div className="p-4 overflow-y-scroll h-[calc(100vh-9rem)]">
      <title>Server Administration</title>
      {/* System management */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">System</h2>
        <div className="flex flex-row space-x-2">
          <SystemRotateSessionMasterKeyForm />
          <IndexerLogsTable />
          <div className="h-4 ml-4">
            <IndexerToggle className="mt-1.5" />
          </div>
        </div>
      </section>
      {/* User and permission management */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Users</h2>
        <UserAddForm className="mb-4" />
        <UserTable />
      </section>
      {/* Root path management */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Library management</h2>
        <RootPathAddForm />
        <RootPathTable />
      </section>
    </div>
  );
};

export default AdminHomePage;
