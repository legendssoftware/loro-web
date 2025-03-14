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
};

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
