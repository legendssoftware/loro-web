'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeInOut' as const,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: 'easeInOut' as const,
        },
    },
};

const slideUpVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut' as const,
        },
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: {
            duration: 0.3,
            ease: 'easeIn' as const,
        },
    },
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
export function PageTransition({
    children,
    type = 'fade',
}: PageTransitionProps) {
    const variants = type === 'slide-up' ? slideUpVariants : pageVariants;

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            className="overflow-hidden w-full h-full"
        >
            {children}
        </motion.div>
    );
}
