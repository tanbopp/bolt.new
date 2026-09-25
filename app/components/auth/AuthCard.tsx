import type { ReactNode } from 'react';

export type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/**
 * Kerangka halaman auth.
 *
 * Mengikuti struktur visual PRD Tahapan 1 §7.1: logo → judul → subjudul →
 * card berisi form (+ link footer di dalam card). Halaman fungsional, bukan
 * landing page: tanpa hero besar, tanpa gradient, tanpa animasi.
 */
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-bolt-elements-background-depth-1 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          {/* Logo bolt.new yang sudah ada (ikon mask dari `icons/logo-text.svg`, rasio 51:21.9). */}
          <span
            className="i-bolt:logo-text?mask w-[46px] h-5 inline-block text-bolt-elements-textPrimary"
            role="img"
            aria-label="Bolt"
          />
          <div>
            <h1 className="text-2xl font-semibold text-bolt-elements-textPrimary">{title}</h1>
            <p className="mt-1 text-sm text-bolt-elements-textSecondary">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-6">
          {children}
        </div>
      </div>
    </main>
  );
}
