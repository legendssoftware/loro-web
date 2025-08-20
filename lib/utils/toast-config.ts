// Standardized toast configuration to be used across the application
export const toastConfig = {
    style: {
        borderRadius: '5px',
        background: '#333',
        color: '#fff',
        fontFamily: 'var(--font-unbounded)',
        fontSize: '12px',
        textTransform: 'uppercase' as const,
        fontWeight: '300',
        padding: '16px',
    },
    duration: 4000,
    position: 'bottom-center' as const,
    zIndex: 100000, //has to be the highest z-index to be on top of all other elements
};

// Framer Motion animation variants for toast
export const toastAnimationVariants = {
    initial: {
        opacity: 0,
        y: 50,
        scale: 0.8,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Token toast ID to ensure only one token toast is visible at a time
let currentTokenToastId: string | null = null;

// Helper function to show a success toast with automatic removal
export const showSuccessToast = (message: string, toast: any) => {
    const toastId = toast.success(message, toastConfig);

    // Automatically dismiss toast after duration
    setTimeout(() => {
        toast.remove(toastId);
    }, toastConfig.duration);

    return toastId;
};

// Helper function to show an error toast with automatic removal
export const showErrorToast = (message: string, toast: any) => {
    const toastId = toast.error(message, toastConfig);

    // Automatically dismiss toast after duration
    setTimeout(() => {
        toast.remove(toastId);
    }, toastConfig.duration);

    return toastId;
};

// Helper function specifically for token operations - ensures only one token toast at a time
export const showTokenSuccessToast = (message: string, toast: any) => {
    // Dismiss any existing token toast
    if (currentTokenToastId) {
        toast.remove(currentTokenToastId);
    }

    // Create new toast
    currentTokenToastId = toast.success(message, {
        ...toastConfig,
        position: 'bottom-center', // Ensure it's always at the bottom
    });

    // Automatically dismiss after duration
    setTimeout(() => {
        toast.remove(currentTokenToastId);
        currentTokenToastId = null;
    }, toastConfig.duration);

    return currentTokenToastId;
};

// Helper function for token error toasts - ensures only one token toast at a time
export const showTokenErrorToast = (message: string, toast: any) => {
    // Dismiss any existing token toast
    if (currentTokenToastId) {
        toast.remove(currentTokenToastId);
    }

    // Create new toast
    currentTokenToastId = toast.error(message, {
        ...toastConfig,
        position: 'bottom-center', // Ensure it's always at the bottom
    });

    // Automatically dismiss after duration
    setTimeout(() => {
        toast.remove(currentTokenToastId);
        currentTokenToastId = null;
    }, toastConfig.duration);

    return currentTokenToastId;
};
