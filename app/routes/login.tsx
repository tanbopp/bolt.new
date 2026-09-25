import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { AuthCard } from '~/components/auth/AuthCard';
import { LoginForm } from '~/components/auth/LoginForm';
import { updateSession } from '~/lib/supabase/middleware';
import { readRedirectParam } from '~/utils/safeRedirect';

export const meta: MetaFunction = () => [
  { title: 'Masuk — Bolt' },
  { name: 'description', content: 'Masuk ke Bolt untuk melanjutkan.' },
];

/**
 * Halaman `/login` (route publik).
 *
 * Bila sudah ada session, user langsung diarahkan ke `?redirect=` (atau `/`).
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const redirectTo = readRedirectParam(request.url);
  const { user, headers } = await updateSession(request, context.cloudflare.env);

  if (user) {
    return redirect(redirectTo, { headers });
  }

  return json({ redirectTo }, { headers });
}

export default function LoginRoute() {
  const { redirectTo } = useLoaderData<typeof loader>();

  return (
    <AuthCard title="Selamat datang" subtitle="Masuk untuk melanjutkan">
      <LoginForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
