import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * Toast — notifikasi auto-dismiss.
 *
 * Cara pakai:
 * 1. Bungkus App dengan <ToastProvider>:
 *      <ToastProvider><App /></ToastProvider>
 * 2. Panggil hook di komponen:
 *      const { toast } = useToast();
 *      toast.success('Data tersimpan');
 *      toast.error('Gagal menyimpan');
 */

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
}

interface ToastContextValue {
  toast: {
    success: (message: string, title?: string) => void;
    error:   (message: string, title?: string) => void;
    info:    (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: React.ReactNode }> = {
  success: {
    bar: 'border-l-4 border-success-500',
    icon: <span className="text-success-500" aria-hidden="true">✓</span>,
  },
  error: {
    bar: 'border-l-4 border-danger-500',
    icon: <span className="text-danger-500" aria-hidden="true">✕</span>,
  },
  info: {
    bar: 'border-l-4 border-primary-500',
    icon: <span className="text-primary-500" aria-hidden="true">i</span>,
  },
  warning: {
    bar: 'border-l-4 border-warning-500',
    icon: <span className="text-warning-500" aria-hidden="true">!</span>,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string, title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((curr) => [...curr, { id, variant, message, title }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value: ToastContextValue = {
    toast: {
      success: (m, t) => push('success', m, t),
      error:   (m, t) => push('error', m, t),
      info:    (m, t) => push('info', m, t),
      warning: (m, t) => push('warning', m, t),
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container — pojok kanan-atas desktop, atas-tengah mobile */}
      <div
        className="fixed z-[60] top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0 pointer-events-none"
        role="region"
        aria-label="Notifikasi"
      >
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { variant, title, message } = item;
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto bg-white rounded-xl shadow-pop p-4 flex items-start gap-3 animate-slide-down',
        styles.bar,
      )}
    >
      <div className="shrink-0 h-6 w-6 rounded-full bg-neutral-50 flex items-center justify-center text-sm font-bold">
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-neutral-900">{title}</p>}
        <p className={cn('text-sm text-neutral-700', title && 'mt-0.5')}>{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="shrink-0 -mr-1 -mt-1 h-6 w-6 inline-flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 focus:outline-none focus-visible:shadow-focus"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  }
  return ctx;
}

// Untuk komponen yang mungkin di-render di luar provider (mis. error boundary)
export function useToastSafe(): ToastContextValue['toast'] | null {
  const ctx = useContext(ToastContext);
  return ctx?.toast ?? null;
}

// Suppress unused warning for hook helper
useEffect; // (no-op, ensures import of useEffect kept for consistency if extended)
