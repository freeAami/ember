import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** A small keycap, used in hints and the command palette. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10',
        'bg-white/[0.04] px-1.5 font-mono text-[11px] text-white/60',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
