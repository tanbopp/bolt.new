import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { toast } from '~/components/ui/Toast';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { mapAuthErrorMessage } from '~/lib/supabase/errors';
import { AUTH_PROVIDERS, type AuthProvider } from '~/types/auth';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('OAuthButtons');

/**
 * Label + ikon per provider.
 *
 * Ikon brand diambil dari koleksi Iconify Phosphor (`i-ph:google-logo`,
 * `i-ph:github-logo`) karena Lucide React tidak lagi menyediakan ikon brand.
 * Seluruh ikon non-brand di halaman auth tetap memakai Lucide React.
 */
const PROVIDER_DETAILS: Record<AuthProvider, { label: string; iconClass: string }> = {
  google: { label: 'Continue with Google', iconClass: 'i-ph:google-logo' },
  github: { label: 'Continue with GitHub', iconClass: 'i-ph:github-logo' },
};

export type OAuthButtonsProps = {
  /** Path internal yang dituju setelah callback OAuth sukses. */
  redirectTo: string;
};

/**
 * Tombol login OAuth (Google & GitHub) memakai `supabase.auth.signInWithOAuth`.
 *
 * Setelah provider diaktifkan di dashboard Supabase, klik tombol ini akan
 * mengarahkan browser ke halaman consent provider, lalu kembali ke
 * `/auth/callback`.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- "OAuth" adalah singkatan resmi (lihat PRD §11)
export function OAuthButtons({ redirectTo }: OAuthButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);

  const handleSignIn = async (provider: AuthProvider) => {
    setPendingProvider(provider);

    try {
      const supabase = getSupabaseBrowserClient();
      const callbackUrl = new URL('/auth/callback', window.location.origin);

      callbackUrl.searchParams.set('redirect', redirectTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) {
        throw error;
      }

      /**
       * Sukses: browser sedang diarahkan ke provider, jadi tombol dibiarkan
       * dalam keadaan loading sampai halaman berpindah.
       */
    } catch (error) {
      setPendingProvider(null);
      toast({
        title: 'Gagal masuk dengan OAuth',
        description: mapAuthErrorMessage(error),
        variant: 'destructive',
      });

      if (import.meta.env.DEV) {
        logger.error(`OAuth ${provider} gagal`, error);
      }
    }
  };

  return (
    <div className="space-y-2">
      {AUTH_PROVIDERS.map((provider) => {
        const details = PROVIDER_DETAILS[provider];

        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            size="lg"
            className="w-full justify-start"
            isLoading={pendingProvider === provider}
            disabled={pendingProvider !== null}
            onClick={() => void handleSignIn(provider)}
          >
            {pendingProvider === provider ? null : (
              <span className={`${details.iconClass} w-4 h-4 shrink-0`} aria-hidden="true" />
            )}
            {details.label}
          </Button>
        );
      })}
    </div>
  );
}
