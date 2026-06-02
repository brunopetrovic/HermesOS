'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      id,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasValue = Boolean(value ?? defaultValue);

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Floating label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-3 transition-all duration-200 ease-out pointer-events-none text-text-secondary',
              leftIcon && 'left-10',
              hasValue
                ? '-top-2.5 text-xs bg-surface px-1.5'
                : 'top-3 text-sm'
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              `
              w-full h-10 px-3 py-2
              bg-surface border border-border rounded-[var(--radius-sm)]
              text-text-primary placeholder:text-text-secondary
              transition-all duration-150 ease-out
              focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow
              disabled:opacity-50 disabled:cursor-not-allowed
              `,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger/30',
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}

        {/* Hint text */}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-text-secondary">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
