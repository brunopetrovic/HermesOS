'use client';

import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { type HTMLAttributes, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

function ModalContent({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  className,
  children,
  ...props
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[calc(100vw-2rem)]',
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={cn(
          `
          relative w-full 
          bg-surface backdrop-blur-lg
          border border-border rounded-[var(--radius-lg)]
          shadow-2xl
          `,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 border-b border-border">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <Icon icon="solar:close-circle-linear" className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

function ModalBottomSheet({
  isOpen,
  onClose,
  title,
  description,
  showCloseButton = true,
  className,
  children,
  ...props
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const bottomSheetContent = (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          `
          absolute bottom-0 left-0 right-0
          bg-surface border-t border-border
          rounded-t-[24px] md:rounded-[var(--radius-lg)]
          shadow-2xl max-h-[85vh] overflow-auto
          `,
          className
        )}
        {...props}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-3">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-text-secondary">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <Icon icon="solar:close-circle-linear" className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-8">{children}</div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(bottomSheetContent, document.body);
  }

  return null;
}

export interface ModalComponent extends React.FC<ModalProps> {
  BottomSheet: typeof ModalBottomSheet;
}

const Modal: ModalComponent = (props) => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return <ModalBottomSheet {...props} />;
  }
  return <ModalContent {...props} />;
};

Modal.BottomSheet = ModalBottomSheet;

export { Modal };
