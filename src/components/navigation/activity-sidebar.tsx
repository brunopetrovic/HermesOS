'use client';

import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { useHermesStore } from '@/lib/store/hermes-store';
import { useEffect } from 'react';
import { formatRelative } from '@/lib/utils';

interface ActivitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivitySidebar({ isOpen, onClose }: ActivitySidebarProps) {
  const { cronJobs, fetchCrons, systemStatus, gateway, fetchStatus } = useHermesStore();

  useEffect(() => {
    fetchCrons();
    fetchStatus();
  }, [fetchCrons, fetchStatus]);

  return (
    <aside
      className={cn(
        'focus-hideable fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out',
        'w-80 h-full flex flex-col',
        'bg-[#0c0e12] border-l border-black',
        'shadow-[inset_5px_0_15px_rgba(0,0,0,0.8)] z-50',
        'xl:relative xl:translate-x-0',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#333a47]/20 shadow-[0_1px_0_rgba(0,0,0,0.8)] shrink-0">
        <h2 className="text-sm font-medium tracking-wide text-slate-300">Live Activity</h2>
        <button
          onClick={onClose}
          className="xl:hidden text-slate-500 hover:text-white transition-colors p-2 -mr-2"
        >
          <Icon icon="solar:close-circle-linear" width={24} />
        </button>
      </div>

      {/* Activity Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Gateway Status */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#1e222a] to-[#161920] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:server-square-linear" className="text-slate-400" width={16} />
              <span className={cn(
                'text-xs font-bold',
                systemStatus === 'online'
                  ? 'text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]'
                  : systemStatus === 'offline' || systemStatus === 'error'
                  ? 'text-red-400 drop-shadow-[0_0_2px_rgba(248,113,113,0.5)]'
                  : 'text-slate-400'
              )}>
                Gateway
              </span>
            </div>
            <span className={cn(
              'w-2 h-2 rounded-full',
              systemStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]'
              : systemStatus === 'offline' || systemStatus === 'error' ? 'bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.8)]'
              : 'bg-slate-500'
            )} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {systemStatus === 'online'
              ? `Running · PID ${gateway?.pid || '—'}`
              : systemStatus === 'loading' || systemStatus === 'error'
              ? 'Checking status...'
              : 'Gateway offline'}
          </p>
        </div>

        {/* Cron Activity */}
        {cronJobs.filter(j => j.enabled !== false).slice(0, 4).map((job) => (
          <div key={job.id} className="p-4 rounded-xl bg-gradient-to-b from-[#1e222a] to-[#161920] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="solar:clock-circle-linear" className="text-slate-400" width={16} />
                <span className="text-xs font-bold text-indigo-400 drop-shadow-[0_0_2px_rgba(129,140,248,0.5)]">
                  {job.name}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed truncate">
              {job.scheduleHuman || job.schedule}
            </p>
            {job.last_run_at && (
              <p className="text-[10px] text-slate-600">
                Last run {formatRelative(job.last_run_at)}
              </p>
            )}
          </div>
        ))}

        {/* Placeholder activities */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#1e222a] to-[#161920] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/30 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:pulse-2-linear" className="text-slate-400" width={16} />
            <span className="text-xs font-bold text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]">Scout</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Monitoring trends and agent activity...</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-[#1e222a] to-[#161920] shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/30 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:pen-new-square-linear" className="text-slate-400" width={16} />
            <span className="text-xs font-bold text-indigo-400 drop-shadow-[0_0_2px_rgba(129,140,248,0.5)]">Quill</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Content pipeline processing...</p>
        </div>
      </div>
    </aside>
  );
}
