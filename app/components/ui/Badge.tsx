import type { ReactNode } from 'react';
import { classNames } from '~/utils/classNames';

export type BadgeVariant = 'default' | 'accent' | 'success';

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-bolt-elements-item-backgroundActive text-bolt-elements-textSecondary',

  /** Token accent bawaan (accent.700 di atas tint 10%) hanya ±4,1:1 → teks dipakai `textPrimary`. */
  accent: 'bg-bolt-elements-item-backgroundAccent text-bolt-elements-textPrimary',
  success: 'bg-green-700 text-white',
};

/** Badge non-interaktif untuk status (mis. plan user). */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
