import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import api from '@/lib/api';

export function SystemRotateSessionMasterKeyForm({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clearSessionToken } = useAuth();
  const { handleSubmit } = useForm();

  const onSubmit = handleSubmit(async () => {
    try {
      const { data, error } = await api.post('/api/admin/regenerate-master-session-key');
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error regenerating session master key', error);
        toast.error('An error occurred generating a new master session key');
        return;
      }
      if (!data.success) {
        // eslint-disable-next-line no-console
        console.error('Failed to generate new session key', data);
        toast.error('An error occurred generating a new master session key');
        return;
      }
      try {
        await clearSessionToken();
      } catch {
        // expect an error here because the session is now invalid
      } finally {
        navigate('/signin');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while resetting the master session key:', error);
      toast.error('An internal server error occurred. Please try again later.');
    }
  });

  return (
    <>
      <Button
        className={`px-2 py-1 rounded mr-4 text-xs uppercase ${className ?? ''}`}
        onClick={() => setOpen(true)}
        variant="outline"
      >
        Terminate all sessions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Terminate all sessions</DialogTitle>
            <DialogDescription>
              This will immediately end all sessions for all users and devices by generating a new secret master session
              key. Each user and device will need to sign in again. You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                End all sessions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
