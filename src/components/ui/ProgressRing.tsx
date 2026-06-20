import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ProgressRingProps {
  /** 0–1 */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  glow?: boolean;
  children?: ReactNode;
}

/**
 * A soft, Apple-Fitness-style progress ring. The arc animates with a spring
 * and can carry a day-driven colour. Track sits beneath at low opacity.
 */
export function ProgressRing({
  progress,
  size = 220,
  stroke = 14,
  color = 'rgb(var(--accent))',
  trackColor = 'rgba(255,255,255,0.06)',
  glow = true,
  children,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = c * (1 - clamped);
  const center = size / 2;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.6 }}
          style={
            glow
              ? { filter: `drop-shadow(0 0 10px ${color})`, opacity: 0.96 }
              : undefined
          }
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
