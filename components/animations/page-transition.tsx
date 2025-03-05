'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    }
  }
};

const slideUpVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    }
  }
};

interface PageTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide-up';
}

/**
 * Component for applying consistent page transition animations.
 * @param children The page content to be animated
 * @param type The type of animation to use ('fade' or 'slide-up')
 */
export function PageTransition({ children, type = 'fade' }: PageTransitionProps) {
  const variants = type === 'slide-up' ? slideUpVariants : pageVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className="w-full h-full overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
