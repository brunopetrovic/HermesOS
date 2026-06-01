'use client';

import { useHermesStore } from '@/lib/store/hermes-store';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { cn, formatRelative } from '@/lib/utils';

export function CronJobsWidget() {
  const cronJobs = useHermesStore(s => s.cronJobs);
const cronsLoading = useHermesStore(s => s.cronsLoading);
const fetchCrons = useHermesStore(s => s.fetchCrons);;

  useEffect(() => {
    fetchCrons();
  }, [fetchCrons]);

  return (
    <div className="neu-card rounded-2xl p-4 md:p-5 hover:border-orange-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-300">Cron Jobs</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {cronJobs.filter((j) => j.enabled !== false).length} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono">hermes-native</span>
          <button onClick={fetchCrons} className="text-slate-600 hover:text-orange-400 transition-colors">
            <Icon icon="solar:refresh-linear" width={14} className={cronsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {cronsLoading && cronJobs.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : cronJobs.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-600 text-sm italic">
          No cron jobs configured
        </div>
      ) : (
        <div className="space-y-3">
          {cronJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0c0e12]/60 border border-black/30"
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                job.enabled !== false
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-[#1a1d24] text-slate-600'
              )}>
                <Icon icon="solar:clock-circle-linear" width={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-300 truncate">{job.name}</p>
                <p className="text-[10px] text-slate-600 truncate">
                  {job.scheduleHuman || job.schedule}
                </p>
              </div>
              <div className="text-right shrink-0">
                {job.last_run_at && (
                  <p className="text-[10px] text-slate-600">{formatRelative(job.last_run_at)}</p>
                )}
                {job.last_status && (
                  <span className={cn(
                    'text-[10px] font-medium',
                    job.last_status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {job.last_status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
