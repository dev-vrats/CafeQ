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
          interactive && 'cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(204,72,60,0.3)] transition-shadow duration-500',
          className
        )}
        whileHover={interactive ? { y: -8, scale: 1.02 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
