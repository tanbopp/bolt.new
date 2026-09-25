import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { AuthCard } from '~/components/auth/AuthCard';
import { SignupForm } from '~/components/auth/SignupForm';
import { updateSession } from '~/lib/supabase/middleware';
import { readRedirectParam } from '~/utils/safeRedirect';

export const meta: MetaFunction = () => [
  { title: 'Daftar — Bolt' },
  { name: 'description', content: 'Buat akun Bolt untuk mulai membangun aplikasi.' },
];

/** Halaman `/signup` (route publik). */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const redirectTo = readRedirectParam(request.url);
  const { user, headers } = await updateSession(request, context.cloudflare.env);

  if (user) {
    return redirect(redirectTo, { headers });
  }

  return json({ redirectTo }, { headers });
}

export default function SignupRoute() {
  const { redirectTo } = useLoaderData<typeof loader>();

  return (
    <AuthCard title="Buat akun" subtitle="Daftar untuk mulai membangun">
      <SignupForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
