import { DarkModeSwitch } from '@/features/dark-mode-switch';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

export default function GuestLayout() {
  const location = useLocation();
  const { user } = useAuth();
  if (user?.accountId) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return (
    <section
      className="
        w-screen
        min-h-screen 
        flex 
        justify-center
        items-center 
        guest"
    >
      <div className="absolute top-4 right-0 p-4">
        <DarkModeSwitch />
      </div>
      <Outlet />
    </section>
  );
}
