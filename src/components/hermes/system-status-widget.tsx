'use client';

import { useHermesStore } from '@/lib/store/hermes-store';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { openAgentOnboarding } from '@/components/connection/agent-onboarding';

export function SystemStatusWidget() {
  const systemStatus = useHermesStore(s => s.systemStatus);
  const gateway = useHermesStore(s => s.gateway);
  const platforms = useHermesStore(s => s.platforms);
  const activeModel = useHermesStore(s => s.activeModel);
  const fetchStatus = useHermesStore(s => s.fetchStatus);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const isOnline = systemStatus === 'online';
  const isLoading = systemStatus === 'loading';
  const isNotConnected = systemStatus === 'not_connected';
  const isDegraded = systemStatus === 'degraded';

  const statusLabel = isLoading
    ? 'Checking...'
    : isOnline
      ? `model: ${activeModel || '—'}`
      : isNotConnected
        ? 'No local agent connected'
        : isDegraded
          ? 'Gateway process found, HTTP unhealthy'
          : 'Gateway offline';

  return (
    <div className="neu-card rounded-2xl p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn(
            'w-2.5 h-2.5 rounded-full shrink-0',
            isOnline
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              : isLoading
                ? 'bg-slate-500 animate-pulse'
                : isNotConnected
                  ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.7)]'
                  : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
          )} />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-slate-200">Local Agent Gateway</h3>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">{statusLabel}</p>
            {gateway?.pid ? (
              <p className="mt-1 text-[10px] text-slate-600">
                pid {gateway.pid} · process {gateway.processAlive ? 'alive' : 'not running'} · http {gateway.httpHealthy ? 'healthy' : 'not healthy'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {isOnline && platforms && Object.entries(platforms).map(([key, val]) => {
            const connected = val.state === 'connected' || val.state === 'running';
            return (
              <div
                key={key}
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center',
                  connected
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[#1a1d24] text-slate-600'
                )}
                title={`${key}: ${val.state}`}
              >
                <Icon
                  icon={key === 'telegram' ? 'solar:chat-round-linear' : key === 'discord' ? 'solar:gamepad-linear' : 'solar:widget-linear'}
                  width={14}
                />
              </div>
            );
          })}

          <button
            onClick={openAgentOnboarding}
            className="h-7 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 text-[11px] font-semibold text-orange-200 transition-colors hover:border-orange-400/50 hover:text-orange-100"
          >
            Configure
          </button>

          <button
            onClick={fetchStatus}
            className="w-7 h-7 rounded-lg bg-[#1a1d24] border border-[#333a47]/30 flex items-center justify-center text-slate-500 hover:text-orange-400 transition-colors"
            aria-label="Refresh gateway status"
          >
            <Icon icon="solar:refresh-linear" width={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
