'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'confirmation' | 'alert';
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  const variantStyles = {
    default: 'border-[#e5e5e5]',
    confirmation: 'border-[#ff0000]',
    alert: 'border-[#ef4444]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} mx-4 bg-white border-2 ${variantStyles[variant]} shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
            <h2
              id="modal-title"
              className="text-xl font-bold text-[#1a1a1a] uppercase tracking-tight"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#1a1a1a] transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
