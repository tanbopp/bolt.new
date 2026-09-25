import * as RadixLabel from '@radix-ui/react-label';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { classNames } from '~/utils/classNames';

export type LabelProps = ComponentPropsWithoutRef<typeof RadixLabel.Root>;

/** Wrapper `Label` (Radix) — otomatis mengaitkan label ke input ber-`id`. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => {
  return (
    <RadixLabel.Root
      ref={ref}
      className={classNames('block text-sm font-medium text-bolt-elements-textPrimary', className)}
      {...props}
    />
  );
});
