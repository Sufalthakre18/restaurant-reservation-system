import toast, { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';

type ToastKind = 'success' | 'info' | 'error';

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#241c1a',
            border: '1px solid #e6ddd0',
            fontSize: '0.875rem',
            fontWeight: 500
          },
          success: { iconTheme: { primary: '#3f6b4a', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#b3382c', secondary: '#ffffff' } }
        }}
      />
    </>
  );
}

export function useToast() {
  return (message: string, kind: ToastKind = 'info') => {
    if (kind === 'success') return toast.success(message);
    if (kind === 'error') return toast.error(message);
    return toast(message);
  };
}