import { forwardRef, type InputHTMLAttributes } from 'react';
import { classNames } from '~/utils/classNames';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Menandai input error: border merah + `aria-invalid`. */
  isInvalid?: boolean;
};

const BASE_CLASSES =
  'w-full h-10 rounded-lg border bg-bolt-elements-background-depth-1 px-3 text-sm ' +
  'text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary transition-theme ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Wrapper input teks.
 *
 * Elemen `<input>` sengaja hanya ada di file ini (lihat
 * `DESIGN-GUARDRAILS.md` §9) — komponen fitur wajib memakai `Input`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, isInvalid = false, ...props }, ref) => {
  return (
    <input
      ref={ref}
      aria-invalid={isInvalid || undefined}
      className={classNames(
        BASE_CLASSES,
        isInvalid ? 'border-red-500 focus-visible:ring-red-500' : 'border-bolt-elements-borderColor',
        className,
      )}
      {...props}
    />
  );
});
