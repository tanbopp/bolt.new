import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { classNames } from '~/utils/classNames';
import { Button } from './Button';
import { Input, type InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'type'>;

/**
 * Input password dengan toggle show/hide memakai ikon Lucide.
 * Toggle adalah `Button` bertipe `button` sehingga tidak men-submit form.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ className, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} type={isVisible ? 'text' : 'password'} className={classNames('pr-11', className)} {...props} />
      <Button
        variant="ghost"
        size="sm"
        icon={isVisible ? EyeOff : Eye}
        aria-label={isVisible ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
        aria-pressed={isVisible}
        className="absolute right-1 top-1 h-8 w-8 px-0"
        onClick={() => setIsVisible((previous) => !previous)}
      />
    </div>
  );
});
