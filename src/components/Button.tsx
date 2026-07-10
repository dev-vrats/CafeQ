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
      primary: 'skeuo-btn-primary',
      secondary: 'skeuo-btn-secondary',
      danger: 'bg-status-jammed text-white border border-[#5a0000] rounded-lg font-bold uppercase tracking-wider shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_4px_6px_rgba(30,3,3,0.3)] hover:brightness-110',
      ghost: 'bg-transparent text-text-muted hover:text-text-dark hover:bg-black/5'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 font-medium',
      lg: 'px-8 py-4 text-lg font-bold'
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
