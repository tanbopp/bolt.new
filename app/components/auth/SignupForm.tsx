import { Link, useNavigate } from '@remix-run/react';
import { MailCheck } from 'lucide-react';
import { useCallback, useState, type FormEvent } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { PasswordInput } from '~/components/ui/PasswordInput';
import { Separator } from '~/components/ui/Separator';
import { toast } from '~/components/ui/Toast';
import { getSupabaseBrowserClient } from '~/lib/supabase/client';
import { mapAuthErrorMessage } from '~/lib/supabase/errors';
import { createScopedLogger } from '~/utils/logger';
import { OAuthButtons } from './OAuthButtons';

const logger = createScopedLogger('SignupForm');

export type SignupFormProps = {
  /** Path internal yang dituju bila signup langsung menghasilkan session. */
  redirectTo: string;
};

/** Form daftar: nama, email, password (+ OAuth). */
export function SignupForm({ redirectTo }: SignupFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      setErrorMessage(null);
      setNotice(null);
      setIsSubmitting(true);

      try {
        const supabase = getSupabaseBrowserClient();
        const callbackUrl = new URL('/auth/callback', window.location.origin);

        callbackUrl.searchParams.set('redirect', redirectTo);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: callbackUrl.toString(),
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          navigate(redirectTo, { replace: true });

          return;
        }

        setNotice(`Akun dibuat. Cek email ${email} untuk verifikasi sebelum masuk.`);
        toast({
          title: 'Akun dibuat',
          description: 'Verifikasi email kamu sebelum masuk.',
          variant: 'success',
        });
      } catch (error) {
        const message = mapAuthErrorMessage(error);

        setErrorMessage(message);
        toast({ title: 'Gagal mendaftar', description: message, variant: 'destructive' });

        if (import.meta.env.DEV) {
          logger.error('Signup email/password gagal', error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, name, navigate, password, redirectTo],
  );

  return (
    <div className="space-y-6">
      <OAuthButtons redirectTo={redirectTo} />

      <Separator label="atau" />

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Nama lengkap"
            value={name}
            isInvalid={errorMessage !== null}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            isInvalid={errorMessage !== null}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            isInvalid={errorMessage !== null}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <p className="text-xs text-bolt-elements-textSecondary">Minimal 6 karakter.</p>
        </div>

        {errorMessage ? <p className="text-xs text-red-500">{errorMessage}</p> : null}

        {notice ? (
          <div className="flex items-start gap-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-3">
            <MailCheck className="w-4 h-4 shrink-0 text-bolt-elements-icon-success" aria-hidden="true" />
            <p className="text-xs text-bolt-elements-textSecondary">{notice}</p>
          </div>
        ) : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
          Daftar
        </Button>
      </form>

      <p className="text-center text-sm text-bolt-elements-textSecondary">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-bolt-elements-item-contentAccent underline underline-offset-2">
          Masuk
        </Link>
      </p>
    </div>
  );
}
