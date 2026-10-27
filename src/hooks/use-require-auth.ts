import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

// Redirects guests to sign-in and, when a role is required, users without it to the home page.
export function useRequireAuth(requiredRole?: string) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      navigate(pathname.startsWith('/signout') ? '/signin' : `/signin?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (requiredRole && !user.roles.includes(requiredRole)) {
      toast.error(`You must be signed in as an ${requiredRole} to access this page.`);
      navigate('/');
    }
  }, [user, loading, navigate, pathname, requiredRole]);

  return { user, loading };
}
