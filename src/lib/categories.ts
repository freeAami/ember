import {
  Briefcase,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  Palette,
  Sparkles,
  Tag,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/types';
import { uid } from './id';

/** Registry of icons selectable for categories. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  heart: HeartPulse,
  dumbbell: Dumbbell,
  school: GraduationCap,
  work: Briefcase,
  user: User,
  home: Home,
  leaf: Leaf,
  palette: Palette,
  wallet: Wallet,
  sparkles: Sparkles,
  tag: Tag,
};

export const ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function iconFor(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? Tag;
}

/** Muted palette — intentionally quiet so badges never shout. */
export const CATEGORY_COLORS: string[] = [
  '124 184 148', // sage
  '132 156 232', // periwinkle
  '208 164 120', // sand
  '194 150 212', // lilac
  '120 196 200', // teal
  '224 158 158', // clay
  '180 188 130', // olive
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'health', name: 'Health', icon: 'heart', color: '124 184 148' },
  { id: 'school', name: 'School', icon: 'school', color: '132 156 232' },
  { id: 'work', name: 'Work', icon: 'work', color: '208 164 120' },
  { id: 'personal', name: 'Personal', icon: 'user', color: '194 150 212' },
];

export function makeCategory(name: string, icon = 'tag', color?: string): Category {
  return {
    id: uid(),
    name: name.trim(),
    icon,
    color: color ?? CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)],
  };
}

export function findCategory(categories: Category[], id?: string): Category | undefined {
  if (!id) return undefined;
  return categories.find((c) => c.id === id);
}
