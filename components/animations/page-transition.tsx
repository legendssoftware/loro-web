'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { pageTransitionVariants, slideUpVariants, fadeVariants } from '@/lib/utils/animations';

type TransitionType = 'default' | 'slide-up' | 'fade';

interface PageTransitionProps extends Omit<MotionProps, 'variants'> {
    children: ReactNode;
    className?: string;
    type?: TransitionType;
}

/**
 * Component for applying consistent page transition animations.
 * @param children The page content to be animated
 * @param className Optional additional classes to apply to the wrapper
 * @param type The type of animation to use ('default', 'slide-up', or 'fade')
 */
export function PageTransition({ children, className = '', type = 'default', ...motionProps }: PageTransitionProps) {
    const getVariants = () => {
        switch (type) {
            case 'slide-up':
                return slideUpVariants;
            case 'fade':
                return fadeVariants;
            default:
                return pageTransitionVariants;
        }
    };

    return (
        <motion.div
            initial='hidden'
            animate='show'
            exit='exit'
            variants={getVariants()}
            className={className}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}
