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
      primary: 'bg-maroon text-white hover:bg-maroon-light shadow-md shadow-maroon/20 border border-maroon-light/50',
      secondary: 'bg-white/50 text-text-dark border border-glass-border hover:bg-white',
      danger: 'bg-status-jammed text-white hover:bg-red-600 shadow-md shadow-red-500/20',
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-xl transition-all duration-300',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {variant === 'primary' && (
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] hover:animate-[shimmer_1.5s_infinite]" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
