import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from './GlassCard';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-maroon text-white hover:bg-maroon-light shadow-[0_10px_20px_-10px_rgba(204,72,60,0.5)] border border-maroon-light/30',
      secondary: 'bg-glass-fill text-text-dark border border-glass-border hover:bg-white backdrop-blur-[20px]',
      danger: 'bg-status-jammed text-white hover:bg-red-500 shadow-[0_10px_20px_-10px_rgba(248,113,113,0.5)]',
      ghost: 'bg-transparent text-text-dark hover:bg-black/5'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 font-medium',
      lg: 'px-8 py-4 text-lg font-bold'
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          'relative overflow-hidden rounded-xl transition-all duration-300',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
        {variant === 'primary' && (
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] hover:animate-[shimmer_1.5s_infinite]" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
