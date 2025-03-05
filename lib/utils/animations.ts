export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.3,
        }
    }
};

export const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: {
            duration: 0.2,
        }
    }
};

// Standard page transition animations
export const pageTransitionVariants = {
    hidden: {
        opacity: 0,
        y: 5
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        y: 5,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

// Slide up transition
export const slideUpVariants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

// Fade transition
export const fadeVariants = {
    hidden: {
        opacity: 0
    },
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
