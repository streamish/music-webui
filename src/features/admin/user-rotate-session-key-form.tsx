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
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '@/lib/api';

type AccountDto = {
  id: number;
};

export function UserRotateSessionKeyForm({ user, className }: { user: AccountDto; className?: string }) {
  const [open, setOpen] = useState(false);
  const { handleSubmit } = useForm();

  const onSubmit = handleSubmit(async () => {
    try {
      const result = await api.post('/api/admin/regenerate-user-session-key', {
        params: {
          query: {
            id: user.id,
          },
        },
      });
      if (result.data?.success) {
        toast.success('User session key rotated successfully.');
        setOpen(false);
        return;
      }
      if (result.error) {
        const { error, message } = result.error;
        for (let i = 0; i < message.length; i += 1) {
          const errorMessage = message[i];
          switch (errorMessage) {
            case 'account-not-found-error':
              toast.error('The specified account does not exist.');
              break;
            default:
              // eslint-disable-next-line no-console
              console.error('Unexpected error occurred while rotating user session key:', error);
              toast.error('An internal server error occurred. Please try again later.');
          }
        }
      } else {
        toast.error('Failed to rotate user session key');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error occurred while rotating user session key:', error);
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
        Terminate sessions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Terminate sessions</DialogTitle>
            <DialogDescription>
              Terminating sessions will invalidate all existing sessions for the user by generating a new secret session
              key. The user will need to log in again from any devices.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                End sessions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
