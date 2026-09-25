import * as RadixAvatar from '@radix-ui/react-avatar';
import { User } from 'lucide-react';
import { classNames } from '~/utils/classNames';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = {
  /** URL gambar avatar (dari provider OAuth atau kolom `users.avatar`). */
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: AvatarSize;
  className?: string;
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-16 h-16 text-lg',
};

const ICON_SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-8 h-8',
};

/** Inisial dari nama atau email, maksimal 2 karakter. */
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || '';

  if (!source) {
    return '';
  }

  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[1].charAt(0) : '';

  return `${first}${second}`.toUpperCase();
}

/** Wrapper `Avatar` (Radix) dengan fallback inisial / ikon user. */
export function Avatar({ src, name, email, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name, email);

  return (
    <RadixAvatar.Root
      className={classNames(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'border border-bolt-elements-borderColor bg-bolt-elements-item-backgroundAccent',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {src ? (
        <RadixAvatar.Image src={src} alt={name ?? email ?? 'Avatar'} className="h-full w-full object-cover" />
      ) : null}
      <RadixAvatar.Fallback className="flex h-full w-full items-center justify-center font-medium text-bolt-elements-textPrimary">
        {initials || <User className={ICON_SIZE_CLASSES[size]} aria-hidden="true" />}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
