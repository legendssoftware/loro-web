'use client';

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, ToastIcon } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                // Determine toast variant for icon
                const toastVariant = variant === 'destructive'
                    ? 'destructive'
                    : variant === 'success'
                    ? 'success'
                    : variant === 'warning'
                    ? 'warning'
                    : 'default';

                return (
                    <Toast key={id} variant={variant} className="animate-bounce-in" {...props}>
                        <div className="flex items-start gap-3">
                            <ToastIcon variant={toastVariant} />
                            <div className='grid gap-1'>
                                {title && <ToastTitle className='text-sm font-medium uppercase font-body'>{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription className='text-xs font-normal font-body'>{description}</ToastDescription>
                                )}
                            </div>
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
