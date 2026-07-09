import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'light' | 'dark';
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'light', interactive = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          variant === 'light' ? 'glass-panel' : 'glass-panel-dark',
          interactive && 'cursor-pointer hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.15)] transition-shadow duration-300',
          className
        )}
        whileHover={interactive ? { y: -4 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
