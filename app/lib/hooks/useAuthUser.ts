import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { readUserProfileMetadata } from '~/lib/supabase/errors';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
};

export function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) {
    return null;
  }

  const { name, avatar } = readUserProfileMetadata(user);

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    avatar,
  };
}

/**
 * Membaca user yang sedang login di browser dan mengikuti perubahan
 * `onAuthStateChange` (login/logout/refresh).
 *
 * Subscription selalu di-unsubscribe saat unmount (lihat `CONVENTIONS.md` §5).
 */
export function useAuthUser(): { user: AuthUser | null; isLoading: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const supabase = getSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      if (!isActive) {
        return;
      }

      setUser(toAuthUser(data.session?.user));
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return;
      }

      setUser(toAuthUser(session?.user));
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}
