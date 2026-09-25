import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useState } from 'react';
import { UserMenu } from '~/components/auth/UserMenu';
import { Avatar } from '~/components/ui/Avatar';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Separator } from '~/components/ui/Separator';
import { toast } from '~/components/ui/Toast';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { mapAuthErrorMessage, readUserProfileMetadata } from '~/lib/supabase/errors';
import { requireSession } from '~/lib/supabase/middleware';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('AccountRoute');

export const meta: MetaFunction = () => [{ title: 'Account — Bolt' }, { name: 'robots', content: 'noindex' }];

/**
 * Halaman `/account` (route terproteksi).
 *
 * Membaca baris `public.users` memakai session dari cookie (RLS membatasi ke
 * baris milik user sendiri). Bila migrasi belum dijalankan, halaman tetap
 * tampil memakai metadata dari session dan menampilkan catatan.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { supabase, user, headers } = await requireSession(request, context.cloudflare.env);

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, avatar, plan, credits, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  const metadata = readUserProfileMetadata(user);

  return json(
    {
      profile: data ?? null,
      profileError: error?.message ?? null,
      isProfileTableMissing: error?.code === 'PGRST205' || error?.code === '42P01',
      sessionUser: {
        id: user.id,
        email: user.email ?? null,
        name: metadata.name,
        avatar: metadata.avatar,
      },
    },
    { headers },
  );
}

export default function AccountRoute() {
  const { profile, profileError, isProfileTableMissing, sessionUser } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      navigate('/login', { replace: true });
    } catch (error) {
      setIsSigningOut(false);
      toast({ title: 'Gagal keluar', description: mapAuthErrorMessage(error), variant: 'destructive' });

      if (import.meta.env.DEV) {
        logger.error('Sign out gagal', error);
      }
    }
  }, [navigate]);

  const typedProfile = profile;
  const displayName = typedProfile?.name ?? sessionUser.name ?? sessionUser.email ?? 'Pengguna';
  const displayEmail = typedProfile?.email ?? sessionUser.email ?? '-';
  const avatarUrl = typedProfile?.avatar ?? sessionUser.avatar;

  return (
    <main className="min-h-screen w-full bg-bolt-elements-background-depth-1">
      <header className="flex h-[var(--header-height)] items-center justify-between border-b border-bolt-elements-borderColor px-5">
        <Link
          to="/"
          className="flex items-center gap-2 text-bolt-elements-textPrimary"
          aria-label="Kembali ke workspace"
        >
          <span className="i-bolt:logo-text?mask w-[46px] h-5 inline-block text-bolt-elements-textPrimary" />
        </Link>
        <UserMenu />
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Workspace
            </Link>
          </Button>
        </div>

        <h1 className="text-2xl font-semibold text-bolt-elements-textPrimary">Account</h1>
        <p className="mt-1 text-sm text-bolt-elements-textSecondary">Profil dan status paket akun kamu.</p>

        <section className="mt-6 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} name={displayName} email={displayEmail} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-bolt-elements-textPrimary">{displayName}</p>
              <p className="truncate text-sm text-bolt-elements-textSecondary">{displayEmail}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-bolt-elements-textSecondary">Plan</dt>
              <dd className="mt-1">
                <Badge variant="accent">{(typedProfile?.plan ?? 'free').toUpperCase()}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-bolt-elements-textSecondary">Credits</dt>
              <dd className="mt-1 text-sm text-bolt-elements-textPrimary">{typedProfile?.credits ?? 0}</dd>
            </div>
          </dl>

          {isProfileTableMissing ? (
            <p className="mt-6 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-3 text-xs text-bolt-elements-textSecondary">
              Tabel <code className="kdb">public.users</code> belum ada di project Supabase. Jalankan{' '}
              <code className="kdb">supabase/migrations/0001_users.sql</code> supaya profil tersimpan otomatis saat
              signup.
            </p>
          ) : null}

          {!isProfileTableMissing && profileError ? <p className="mt-6 text-xs text-red-500">{profileError}</p> : null}

          {!isProfileTableMissing && !profileError && !typedProfile ? (
            <p className="mt-6 text-xs text-bolt-elements-textSecondary">
              Baris profil belum ada untuk akun ini. Profil dibuat otomatis oleh trigger saat signup.
            </p>
          ) : null}
        </section>

        <div className="mt-6 flex justify-end">
          <Button variant="danger" size="md" isLoading={isSigningOut} onClick={() => void handleSignOut()}>
            Log out
          </Button>
        </div>
      </div>
    </main>
  );
}
