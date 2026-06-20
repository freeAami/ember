import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-ink-50 hover:brightness-110 shadow-glow font-medium',
  ghost:
    'text-white/70 hover:text-white hover:bg-white/[0.06]',
  subtle:
    'bg-white/[0.05] text-white/85 hover:bg-white/[0.09] border border-white/10',
  danger:
    'text-rose-300 hover:bg-rose-500/10 border border-rose-500/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  icon: 'h-9 w-9 rounded-lg justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'ghost', size = 'md', children, ...rest }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'inline-flex items-center select-none outline-none transition-colors',
        variants[variant],
        sizes[size],
        className,
      )}
      {...(rest as unknown as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  ),
);
Button.displayName = 'Button';
