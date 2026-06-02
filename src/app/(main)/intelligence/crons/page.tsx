'use client';

import { Icon } from '@iconify/react';
import { useHermesStore } from '@/lib/store/hermes-store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect } from 'react';
import { formatRelative } from '@/lib/utils';

export default function IntelligenceCronsPage() {
  const { cronJobs, cronsStats, cronsLoading, fetchCrons } = useHermesStore(
    useShallow(s => ({
      cronJobs: s.cronJobs,
      cronsStats: s.cronsStats,
      cronsLoading: s.cronsLoading,
      fetchCrons: s.fetchCrons,
    }))
  );

  useEffect(() => { fetchCrons(); }, []);

  return (
    <>
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <Icon icon="solar:clock-circle-linear" className="text-orange-500 glow-orange" width={22} />
        <div>
          <h1 className="text-lg font-medium text-slate-200">Cron Jobs</h1>
          <p className="text-xs text-slate-500">{cronsStats.total} total · {cronsStats.enabled} enabled</p>
        </div>
      </div>

      <div className="px-2 space-y-3 animate-slide-up stagger-2">
        {cronsLoading ? (
          <p className="text-sm text-slate-500 text-center py-8">Loading crons...</p>
        ) : cronJobs.map((job) => (
          <div key={job.id} className="neu-card rounded-2xl p-4 hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                job.enabled ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'bg-slate-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{job.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{job.scheduleHuman || job.schedule}</p>
              </div>
              <div className="text-right shrink-0">
                {job.last_run_at && (
                  <p className="text-[10px] text-slate-600">Last run {formatRelative(job.last_run_at)}</p>
                )}
                <p className={`text-[10px] ${job.last_status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {job.last_status || 'pending'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 pl-5 line-clamp-2">{job.prompt}</p>
          </div>
        ))}
      </div>
    </>
  );
}
