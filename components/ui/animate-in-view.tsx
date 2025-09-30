'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimateInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  amount?: number;
}

export function AnimateInView({ 
  children, 
  className = '',
  delay = 0,
  direction = 'up',
  amount = 0.1
}: AnimateInViewProps) {
  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0,
        transition: { 
          duration: 0.6, 
          ease: [0.16, 1, 0.3, 1],
          delay
        }
      }}
      viewport={{ once: true, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
