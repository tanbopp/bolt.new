import * as RadixSeparator from '@radix-ui/react-separator';
import { classNames } from '~/utils/classNames';

export type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;

  /** Teks kecil di tengah separator (mis. "atau"). */
  label?: string;
};

/** Wrapper `Separator` (Radix). Bila `label` diisi, garis dibagi dua. */
export function Separator({ orientation = 'horizontal', className, label }: SeparatorProps) {
  if (label && orientation === 'horizontal') {
    return (
      <div className={classNames('flex items-center gap-3', className)}>
        <RadixSeparator.Root className="h-px flex-1 bg-bolt-elements-dividerColor" />
        <span className="text-xs text-bolt-elements-textSecondary">{label}</span>
        <RadixSeparator.Root className="h-px flex-1 bg-bolt-elements-dividerColor" />
      </div>
    );
  }

  return (
    <RadixSeparator.Root
      orientation={orientation}
      className={classNames(
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        'bg-bolt-elements-dividerColor',
        className,
      )}
    />
  );
}
