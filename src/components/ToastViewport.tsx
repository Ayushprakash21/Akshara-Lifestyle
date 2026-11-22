import React from 'react';
import { X } from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';

export function ToastViewport() {
  const { toasts, dismissToast } = useCommerce();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-[#171717] text-[#F7F4EE] border border-[#2E2C29] px-4 py-3.5 shadow-lg flex items-start justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white leading-snug">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs text-[#C5C0B8] leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label={`Dismiss ${toast.title}`}
            className="text-[#85817B] hover:text-white transition-colors p-0.5 shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}
