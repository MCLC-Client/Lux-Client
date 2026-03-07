import React from 'react';
import { Toaster as Sonner } from 'sonner';

function Toaster(props: React.ComponentProps<typeof Sonner>) {
    return (
        <Sonner
            expand
            position="bottom-right"
            visibleToasts={4}
            toastOptions={{
                classNames: {
                    toast: 'mclc-sonner-toast',
                    title: 'mclc-sonner-title',
                    description: 'mclc-sonner-description',
                    success: 'mclc-sonner-success',
                    error: 'mclc-sonner-error',
                    info: 'mclc-sonner-info',
                    warning: 'mclc-sonner-warning',
                    actionButton: 'mclc-sonner-action',
                    cancelButton: 'mclc-sonner-cancel'
                }
            }}
            {...props}
        />
    );
}

export { Toaster };
