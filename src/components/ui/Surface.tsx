import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the top-edge sheen highlight used on raised cards. */
  sheen?: boolean;
}

/** A glass panel — the fundamental surface of the app. */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, sheen = true, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass relative rounded-[var(--radius)]',
        sheen && 'sheen',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);
Surface.displayName = 'Surface';
