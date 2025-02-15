import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

const defaultOptions: ToastOptions = {
  duration: 3000,
  position: 'top-right',
};

export const showToast = {
  success: (message: string, options: ToastOptions = {}) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
      className: 'text-xs font-normal uppercase font-body',
    });
  },

  error: (message: string, error?: Error | string, options: ToastOptions = {}) => {
    const errorMessage = error 
      ? typeof error === 'string' 
        ? error 
        : error.message || 'An error occurred'
      : message;

    return toast.error(errorMessage, {
      ...defaultOptions,
      duration: 4000,
      ...options,
      className: 'text-xs font-normal uppercase font-body',
    });
  },

  loading: (message: string, options: ToastOptions = {}) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
      className: 'text-xs font-normal uppercase font-body',
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options: ToastOptions = {}
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...defaultOptions,
        ...options,
        className: 'text-xs font-normal uppercase font-body',
      }
    );
  },
}; 