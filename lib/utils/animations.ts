import { Variants } from 'framer-motion';

/**
 * Detect if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if device is mobile for performance optimization
 */
export const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
};

/**
 * Get optimized animation duration based on device and user preferences
 */
export const getOptimizedDuration = (baseDuration: number) => {
    if (prefersReducedMotion()) return 0;
    if (isMobileDevice()) return baseDuration * 0.7; // 30% faster on mobile
    return baseDuration;
};

/**
 * Get optimized viewport threshold for mobile devices
 */
export const getViewportThreshold = (baseThreshold: number = 0.2) => {
    if (isMobileDevice()) return Math.max(0.1, baseThreshold * 0.5); // Lower threshold on mobile
    return baseThreshold;
};

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
            duration: getOptimizedDuration(0.3),
            ease: 'easeInOut',
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: getOptimizedDuration(0.3),
            ease: 'easeInOut',
        }
    }
};

/**
 * Slide up animation for page transitions (mobile optimized)
 */
export const slideUpVariants: Variants = {
    initial: {
        opacity: 0,
        y: isMobileDevice() ? 10 : 20, // Reduced movement on mobile
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: getOptimizedDuration(0.5),
            ease: 'easeOut',
        }
    },
    exit: {
        opacity: 0,
        y: isMobileDevice() ? 10 : 20,
        transition: {
            duration: getOptimizedDuration(0.3),
            ease: 'easeIn',
        }
    }
};

/**
 * Animation for list items (mobile optimized)
 */
export const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: isMobileDevice() ? 5 : 10 // Reduced movement on mobile
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: getOptimizedDuration(0.3),
        }
    }
};

/**
 * Staggered container animation for lists (mobile optimized)
 */
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: isMobileDevice() ? 0.05 : 0.1, // Faster stagger on mobile
            delayChildren: getOptimizedDuration(0.2),
        }
    }
};

/**
 * Animation for fade in/out (mobile optimized)
 */
export const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: getOptimizedDuration(0.4)
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: getOptimizedDuration(0.3)
        }
    }
};

/**
 * Scale animation for elements that grow/shrink (mobile optimized)
 */
export const scaleVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: isMobileDevice() ? 0.95 : 0.9 // Less dramatic scale on mobile
    },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: isMobileDevice() ? 400 : 300, // Stiffer spring on mobile for faster animations
            damping: isMobileDevice() ? 25 : 20
        }
    },
    exit: {
        opacity: 0,
        scale: isMobileDevice() ? 0.95 : 0.9,
        transition: {
            duration: getOptimizedDuration(0.3)
        }
    }
};

/**
 * Hero text animation optimized for mobile readability
 */
export const heroTextVariants: Variants = {
    initial: {
        y: isMobileDevice() ? 20 : 50,
        opacity: 0
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: getOptimizedDuration(0.5),
            ease: "easeOut"
        }
    },
    exit: {
        y: isMobileDevice() ? -20 : -50,
        opacity: 0,
        transition: {
            duration: getOptimizedDuration(0.5),
            ease: "easeInOut"
        }
    }
};

/**
 * Mobile-optimized motion section props
 */
export const getMobileOptimizedMotionProps = () => ({
    threshold: getViewportThreshold(),
    once: true, // Always use once on mobile for performance
    rootMargin: isMobileDevice() ? '0px 0px -50px 0px' : '0px 0px -100px 0px' // Trigger earlier on mobile
});
