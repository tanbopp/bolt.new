import { Link, useNavigate } from '@remix-run/react';
import { LogOut, UserRound } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { Avatar } from '~/components/ui/Avatar';
import { Button } from '~/components/ui/Button';
import { Skeleton } from '~/components/ui/Skeleton';
import { toast } from '~/components/ui/Toast';
import { useAuthUser } from '~/lib/hooks/useAuthUser';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { mapAuthErrorMessage } from '~/lib/supabase/errors';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('UserMenu');

const MENU_ITEM_CLASSES =
  'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-bolt-elements-textPrimary ' +
  'outline-none hover:bg-bolt-elements-item-backgroundActive focus:bg-bolt-elements-item-backgroundActive';

/**
 * Menu user di header.
 *
 * - Belum login → tombol "Sign in" menuju `/login`.
 * - Sudah login → `DropdownMenu` (Radix) berisi Account & Log out.
 */
export function UserMenu() {
  const { user, isLoading } = useAuthUser();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
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
      toast({
        title: 'Gagal keluar',
        description: mapAuthErrorMessage(error),
        variant: 'destructive',
      });

      if (import.meta.env.DEV) {
        logger.error('Sign out gagal', error);
      }
    }
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return (
      <Button variant="primary" size="md" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="md" className="h-9 w-9 px-0" aria-label="Menu akun">
          <Avatar src={user.avatar} name={user.name} email={user.email} size="md" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-max min-w-56 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-1 shadow-md"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar src={user.avatar} name={user.name} email={user.email} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-bolt-elements-textPrimary">
                {user.name ?? user.email ?? 'Pengguna'}
              </p>
              {user.email ? <p className="truncate text-xs text-bolt-elements-textSecondary">{user.email}</p> : null}
            </div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-bolt-elements-dividerColor" />
          <DropdownMenu.Item className={MENU_ITEM_CLASSES} onSelect={() => navigate('/account')}>
            <UserRound className="w-4 h-4" aria-hidden="true" />
            Account
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={MENU_ITEM_CLASSES}
            disabled={isSigningOut}
            onSelect={() => void handleSignOut()}
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
