import { useNavigate } from '@remix-run/react';
import { useEffect } from 'react';
import { AuthCard } from '~/components/auth/AuthCard';
import { Skeleton } from '~/components/ui/Skeleton';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('LogoutRoute');

/**
 * Halaman `/logout`.
 *
 * Alternatif selain menu dropdown: membuka `/logout` akan menutup session lalu
 * mengarahkan ke `/login`.
 */
export default function LogoutRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          logger.error('Sign out gagal di /logout', error);
        }
      } finally {
        if (isActive) {
          navigate('/login', { replace: true });
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <AuthCard title="Keluar" subtitle="Mengakhiri sesi kamu">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </AuthCard>
  );
}
