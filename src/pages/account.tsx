import { IndexerLogsTable } from '@/features/account/indexer-logs-table';
import { RootPathAddForm, RootPathTable } from '@/components';
import { UserChangePasswordForm } from '@/features/account/user-change-password';
import { UserRotateSessionKeyForm } from '@/features/account/user-rotate-session-key-form';
import UiPreferences from '@/features/account/ui-preferences';

const AccountPreferencesPage = () => {
  return (
    <div className="px-4 overflow-y-auto h-[calc(100vh-9rem)]">
      <title>Account preferences</title>
      {/* General preferences */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-foreground/60">General preferences</h2>
        <UiPreferences />
      </section>
      {/* System management */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-foreground/60">System</h2>
        <div className="flex flex-row space-x-2">
          <div className="h-8">
            <UserChangePasswordForm />
            <UserRotateSessionKeyForm />
          </div>
        </div>
      </section>
      {/* Root path management */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2 text-foreground/60">Library management</h2>
        <RootPathAddForm />
        <RootPathTable />
      </section>
      {/* Indexer logs */}
      <section>
        <h2 className="font-semibold mb-2 text-foreground/60">Indexer logs</h2>
        <IndexerLogsTable />
      </section>
    </div>
  );
};

export default AccountPreferencesPage;
