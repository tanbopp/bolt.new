import { useLocation, useNavigate } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AuthCard } from '~/components/auth/AuthCard';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { mapAuthErrorMessage } from '~/lib/supabase/errors';
import { createScopedLogger } from '~/utils/logger';
import { sanitizeRedirectPath } from '~/utils/safeRedirect';

const logger = createScopedLogger('AuthCallbackRoute');

/**
 * Halaman `/auth/callback`.
 *
 * Menukar `code` (PKCE/OAuth) dari Supabase menjadi session, lalu mengarahkan
 * user ke `?redirect=` atau `/`. Alur ini dijalankan di browser karena
 * `@supabase/ssr` menyimpan code verifier PKCE di cookie yang hanya bisa dibaca
 * client yang memulai login.
 */
export default function AuthCallbackRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasExchangedRef = useRef(false);

  useEffect(() => {
    if (hasExchangedRef.current) {
      return;
    }

    hasExchangedRef.current = true;

    const run = async () => {
      const params = new URLSearchParams(location.search);
      const redirectTo = sanitizeRedirectPath(params.get('redirect'));
      const errorDescription = params.get('error_description') ?? params.get('error');
      const code = params.get('code');

      if (errorDescription) {
        navigate(`/auth/error?message=${encodeURIComponent(errorDescription)}`, { replace: true });

        return;
      }

      if (!code) {
        navigate(`/auth/error?message=${encodeURIComponent('Kode otorisasi tidak ditemukan pada URL callback.')}`, {
          replace: true,
        });

        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        navigate(redirectTo, { replace: true });
      } catch (error) {
        const message = mapAuthErrorMessage(error);

        if (import.meta.env.DEV) {
          logger.error('Tukar code menjadi session gagal', error);
        }

        navigate(`/auth/error?message=${encodeURIComponent(message)}`, { replace: true });
      }
    };

    void run();
  }, [location.search, navigate]);

  return (
    <AuthCard title="Menyelesaikan masuk" subtitle="Memverifikasi sesi kamu">
      <div className="flex items-center justify-center gap-2 text-sm text-bolt-elements-textSecondary">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        Mohon tunggu sebentar…
      </div>
    </AuthCard>
  );
}
