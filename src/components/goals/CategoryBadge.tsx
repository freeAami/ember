import type { Category } from '@/types';
import { iconFor } from '@/lib/categories';
import { cn } from '@/lib/cn';

interface CategoryBadgeProps {
  category: Category | undefined;
  /** Show the icon glyph alongside the dot + label. */
  withIcon?: boolean;
  className?: string;
}

/** A deliberately quiet category chip: a colored dot, a soft label. */
export function CategoryBadge({ category, withIcon, className }: CategoryBadgeProps) {
  if (!category) return null;
  const Icon = iconFor(category.icon);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]',
        className,
      )}
      style={{
        borderColor: `rgb(${category.color} / 0.25)`,
        background: `rgb(${category.color} / 0.08)`,
        color: `rgb(${category.color})`,
      }}
    >
      {withIcon ? (
        <Icon size={11} />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${category.color})` }} />
      )}
      <span className="font-medium opacity-90">{category.name}</span>
    </span>
  );
}
