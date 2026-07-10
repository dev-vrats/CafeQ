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
          variant === 'light' ? 'skeuo-panel' : 'skeuo-panel-dark',
          interactive && 'cursor-pointer hover:shadow-[0_15px_30px_-5px_rgba(30,3,3,0.3)] transition-shadow duration-300',
          className
        )}
        whileHover={interactive ? { y: -2, scale: 1.01 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
