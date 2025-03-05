import { Variants } from 'framer-motion';

/**
 * Base page transition animation
 */
export const pageTransitionVariants: Variants = {
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

/**
 * Slide up animation for page transitions
 */
export const slideUpVariants: Variants = {
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

/**
 * Animation for list items
 */
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
        }
    }
};

/**
 * Staggered container animation for lists
 */
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        }
    }
};

/**
 * Animation for fade in/out
 */
export const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.4
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.3
        }
    }
};

/**
 * Scale animation for elements that grow/shrink
 */
export const scaleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
            duration: 0.3
        }
    }
};
