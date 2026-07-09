import React from 'react';
import { cn } from './GlassCard';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface BentoGridProps extends HTMLMotionProps<"div"> {
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ className, children, ...props }) => {
  return (
    <motion.div
      className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[140px]", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface BentoItemProps extends HTMLMotionProps<"div"> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
}

export const BentoItem: React.FC<BentoItemProps> = ({ colSpan = 1, rowSpan = 1, className, children, ...props }) => {
  
  const colStyles = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-2 md:col-span-3',
    4: 'col-span-2 md:col-span-4'
  };
  
  const rowStyles = {
    1: 'row-span-1',
    2: 'row-span-2'
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
      }}
      className={cn(colStyles[colSpan], rowStyles[rowSpan], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
