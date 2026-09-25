import { Slot, Slottable } from '@radix-ui/react-slot';
import { Loader2, type LucideIcon } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { classNames } from '~/utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `primary` = aksi utama, `outline` = aksi sekunder (mis. OAuth), `danger` = destruktif. */
  variant?: ButtonVariant;
  size?: ButtonSize;

  /** Render sebagai child (mis. `<Link>`) memakai Radix `Slot`. */
  asChild?: boolean;

  /** Menampilkan spinner Lucide dan menonaktifkan tombol. */
  isLoading?: boolean;

  /** Ikon Lucide di kiri label. Ukuran mengikuti `size` agar konsisten. */
  icon?: LucideIcon;
  iconClassName?: string;
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-theme ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /**
   * Tombol primer dibuat solid, bukan memakai token tonal bawaan
   * (`button-primary-background` + `text accent.500`) karena kombinasi token
   * bawaan hanya mencapai kontras ±2,3:1 di light mode dan gagal WCAG AA.
   * Solid `accent-700` + teks putih = 4,7:1 (lihat TAHAPAN-1-NOTES §4).
   */
  primary: 'bg-accent-700 text-white hover:bg-accent-800',
  secondary:
    'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text ' +
    'hover:bg-bolt-elements-button-secondary-backgroundHover',
  outline:
    'border border-bolt-elements-borderColor bg-transparent text-bolt-elements-textPrimary ' +
    'hover:bg-bolt-elements-item-backgroundActive',
  ghost:
    'bg-transparent text-bolt-elements-textSecondary hover:bg-bolt-elements-item-backgroundActive ' +
    'hover:text-bolt-elements-textPrimary',

  /** Token danger bawaan juga gagal kontras di light mode (±3,3:1) → dipakai solid red. */
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * Wrapper tombol berbasis Radix `Slot`.
 *
 * Radix UI tidak menyediakan primitive Button, jadi elemen `<button>` hanya
 * boleh berada di file ini (lihat `DESIGN-GUARDRAILS.md` §9). Semua komponen
 * fitur wajib memakai `Button`, bukan `<button>` mentah.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      isLoading = false,
      icon,
      iconClassName,
      children,
      disabled,
      type,
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : 'button';
    const isDisabled = disabled === true || isLoading;
    const iconClasses = classNames(ICON_SIZE_CLASSES[size], iconClassName);

    /* StrictPascalCase diperlukan agar bisa dirender sebagai komponen JSX. */
    const IconComponent = icon;

    const behaviourProps = asChild
      ? { 'aria-disabled': isDisabled || undefined }
      : { type: type ?? 'button', disabled: isDisabled };

    return (
      <Component
        ref={ref}
        aria-busy={isLoading || undefined}
        className={classNames(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
        {...behaviourProps}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={classNames(iconClasses, 'animate-spin')} aria-hidden="true" />
        ) : (
          IconComponent && <IconComponent className={iconClasses} aria-hidden="true" />
        )}
        {/** `asChild` memakai Slot, jadi child utama ditandai `Slottable` agar ikon/spinner tetap boleh dirender sebagai sibling. */}
        {asChild ? <Slottable>{children}</Slottable> : children}
      </Component>
    );
  },
);
