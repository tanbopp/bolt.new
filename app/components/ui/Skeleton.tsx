import { classNames } from '~/utils/classNames';

export type SkeletonProps = {
  className?: string;
};

/**
 * Placeholder loading.
 *
 * Sengaja tanpa animasi `pulse` terus-menerus (dilarang
 * `DESIGN-GUARDRAILS.md` §3.2) — cukup blok abu-abu statis.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={classNames('rounded-md bg-bolt-elements-item-backgroundActive', className)} />
  );
}
