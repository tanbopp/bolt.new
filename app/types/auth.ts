/**
 * Tipe entitas user/session (lihat `CONVENTIONS.md` §4).
 * Skema mengikuti tabel `public.users` pada `supabase/migrations/0001_users.sql`.
 */

export const USER_PLANS = ['free', 'pro', 'team'] as const;

export type UserPlan = (typeof USER_PLANS)[number];

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  plan: UserPlan;
  credits: number;
  created_at: string;
  updated_at: string;
};

export type AuthProvider = 'google' | 'github';

export const AUTH_PROVIDERS: readonly AuthProvider[] = ['google', 'github'];

export type AuthProviderConfig = {
  provider: AuthProvider;
  label: string;
};
