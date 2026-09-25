import { Link, useSearchParams } from '@remix-run/react';
import { AlertCircle } from 'lucide-react';
import { AuthCard } from '~/components/auth/AuthCard';
import { Button } from '~/components/ui/Button';

const DEFAULT_MESSAGE = 'Terjadi kesalahan saat memproses autentikasi.';

/** Halaman `/auth/error` untuk kegagalan OAuth / callback. */
export default function AuthErrorRoute() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') ?? DEFAULT_MESSAGE;

  return (
    <AuthCard title="Gagal masuk" subtitle="Proses autentikasi tidak selesai">
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-bolt-elements-icon-error" aria-hidden="true" />
          <p className="text-xs text-bolt-elements-textSecondary">{message}</p>
        </div>

        <Button variant="primary" size="lg" className="w-full" asChild>
          <Link to="/login">Coba lagi</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
