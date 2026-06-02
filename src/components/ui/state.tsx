'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LoadingState({ title = 'Loading', detail }: { title?: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-8 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-accent/20 bg-accent/10 flex items-center justify-center text-accent">
        <Icon icon="solar:refresh-linear" className="animate-spin" width={22} />
      </div>
      <p className="text-sm font-bold text-text-primary">{title}</p>
      {detail && <p className="mt-1 text-xs text-text-secondary">{detail}</p>}
    </div>
  );
}

export function EmptyState({
  icon = 'solar:ghost-linear',
  title,
  detail,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon?: string;
  title: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const actionClasses = 'mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-accent px-4 text-xs font-bold text-accent transition hover:bg-accent/10 active:scale-[0.98]';

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full border border-border bg-bg-secondary flex items-center justify-center text-text-secondary">
        <Icon icon={icon} width={30} />
      </div>
      <h3 className="text-base font-black text-text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-text-secondary">{detail}</p>
      {actionLabel && actionHref && <Link href={actionHref} className={actionClasses}>{actionLabel}</Link>}
      {actionLabel && onAction && <button onClick={onAction} className={actionClasses}>{actionLabel}</button>}
    </div>
  );
}

export function ErrorState({
  title = 'Something broke',
  detail,
  onRetry,
}: {
  title?: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-left">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-2 text-danger">
          <Icon icon="solar:shield-warning-linear" width={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text-primary">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">{detail}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-3 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-bold text-danger transition hover:bg-danger/10">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConnectionRequiredState({
  className,
  onConnect,
}: {
  className?: string;
  onConnect?: () => void;
}) {
  return (
    <div className={cn('rounded-2xl border border-orange-500/25 bg-orange-500/10 p-5', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-100">Agent connection required</p>
          <p className="mt-1 text-xs leading-relaxed text-orange-200/80">
            UNOX can run in local demo mode, but live memory, models, crons, runs, and Una streaming need a reachable local/private agent gateway.
          </p>
        </div>
        {onConnect && (
          <button onClick={onConnect} className="h-10 shrink-0 rounded-xl bg-orange-500 px-4 text-xs font-black text-white transition hover:bg-orange-600 active:scale-[0.98]">
            Connect agent
          </button>
        )}
      </div>
    </div>
  );
}
