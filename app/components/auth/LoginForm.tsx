import { Link, useNavigate } from '@remix-run/react';
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
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { OAuthButtons } from './OAuthButtons';

const logger = createScopedLogger('LoginForm');

export type LoginFormProps = {
  /** Path internal yang dituju setelah login sukses (dari `?redirect=`). */
  redirectTo: string;
};

/** Form login: OAuth + email/password. */
export function LoginForm({ redirectTo }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }

        navigate(redirectTo, { replace: true });
      } catch (error) {
        const message = mapAuthErrorMessage(error);

        setErrorMessage(message);
        toast({ title: 'Gagal masuk', description: message, variant: 'destructive' });

        if (import.meta.env.DEV) {
          logger.error('Login email/password gagal', error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, navigate, password, redirectTo],
  );

  return (
    <div className="space-y-6">
      <OAuthButtons redirectTo={redirectTo} />

      <Separator label="atau" />

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
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
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1 text-xs"
              onClick={() => setIsForgotPasswordOpen(true)}
            >
              Lupa password?
            </Button>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={password}
            isInvalid={errorMessage !== null}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {errorMessage ? <p className="text-xs text-red-500">{errorMessage}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
          Masuk
        </Button>
      </form>

      <p className="text-center text-sm text-bolt-elements-textSecondary">
        Belum punya akun?{' '}
        <Link to="/signup" className="font-medium text-bolt-elements-item-contentAccent underline underline-offset-2">
          Daftar
        </Link>
      </p>

      <ForgotPasswordDialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen} />
    </div>
  );
}
