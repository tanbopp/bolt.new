import { useStore } from '@nanostores/react';
import * as RadixToast from '@radix-ui/react-toast';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { atom } from 'nanostores';
import { useState, type ReactNode } from 'react';
import { classNames } from '~/utils/classNames';
import { Button } from './Button';

export type ToastVariant = 'info' | 'success' | 'destructive';

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;

  /** Durasi tampil dalam ms (default 5000). */
  duration?: number;
};

type ToastItem = ToastInput & {
  id: number;
  variant: ToastVariant;
};

const DEFAULT_DURATION = 5000;

/** Daftar toast aktif. Dipakai oleh `ToastProvider`. */
export const toastsStore = atom<ToastItem[]>([]);

let nextToastId = 1;

/**
 * Menampilkan toast (Radix Toast) — pengganti `alert()`.
 *
 * Pemakaian: `toast({ title: 'Gagal masuk', description: 'Email atau password salah', variant: 'destructive' })`
 */
export function toast(input: ToastInput): number {
  const id = nextToastId++;

  toastsStore.set([...toastsStore.get(), { ...input, id, variant: input.variant ?? 'info' }]);

  return id;
}

export function dismissToast(id: number): void {
  toastsStore.set(toastsStore.get().filter((item) => item.id !== id));
}

type ToastIconProps = {
  variant: ToastVariant;
};

function ToastIcon({ variant }: ToastIconProps) {
  const className = 'w-5 h-5 shrink-0';

  switch (variant) {
    case 'success': {
      return <CheckCircle2 className={classNames(className, 'text-bolt-elements-icon-success')} aria-hidden="true" />;
    }

    case 'destructive': {
      return <AlertCircle className={classNames(className, 'text-bolt-elements-icon-error')} aria-hidden="true" />;
    }

    default: {
      return <Info className={classNames(className, 'text-bolt-elements-item-contentAccent')} aria-hidden="true" />;
    }
  }
}

function ToastRow({ item }: { item: ToastItem }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <RadixToast.Root
      open={isOpen}
      duration={item.duration ?? DEFAULT_DURATION}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (!open) {
          dismissToast(item.id);
        }
      }}
      className={classNames(
        'pointer-events-auto flex items-start gap-3 rounded-lg border border-bolt-elements-borderColor',
        'bg-bolt-elements-background-depth-1 p-4 shadow-md',
      )}
    >
      <ToastIcon variant={item.variant} />
      <div className="flex-1 space-y-1">
        <RadixToast.Title className="text-sm font-medium text-bolt-elements-textPrimary">{item.title}</RadixToast.Title>
        {item.description ? (
          <RadixToast.Description className="text-xs text-bolt-elements-textSecondary">
            {item.description}
          </RadixToast.Description>
        ) : null}
      </div>
      <RadixToast.Close asChild>
        <Button variant="ghost" size="sm" aria-label="Tutup notifikasi" className="h-6 w-6 px-0">
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </RadixToast.Close>
    </RadixToast.Root>
  );
}

/**
 * Provider Radix Toast. Dipasang sekali di `app/root.tsx` supaya toast bisa
 * muncul di semua halaman (termasuk halaman auth).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const items = useStore(toastsStore);

  return (
    <RadixToast.Provider swipeDirection="right" duration={DEFAULT_DURATION}>
      {children}
      {items.map((item) => (
        <ToastRow key={item.id} item={item} />
      ))}
      <RadixToast.Viewport className="pointer-events-none fixed bottom-0 right-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </RadixToast.Provider>
  );
}
