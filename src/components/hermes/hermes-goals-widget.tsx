'use client';

import { useHermesStore } from '@/lib/store/hermes-store';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function HermesGoalsWidget() {
  const goals = useHermesStore(s => s.goals);
const goalsLoading = useHermesStore(s => s.goalsLoading);
const fetchGoals = useHermesStore(s => s.fetchGoals);;

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="neu-card rounded-2xl p-4 md:p-5 hover:border-orange-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-300">Goal Progress</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {activeGoals.length} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono">hermes-native</span>
          <button onClick={fetchGoals} className="text-slate-600 hover:text-orange-400 transition-colors">
            <Icon icon="solar:refresh-linear" width={14} className={goalsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {goalsLoading && goals.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-600 text-sm italic">
          No goals configured
        </div>
      ) : (
        <div className="space-y-5">
          {goals.map((goal) => {
            const tasks = goal.tasks || [];
            const done = tasks.filter((t) => t.status === 'done' || t.status === 'completed').length;
            const total = tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 min-w-0">
                    <Icon icon="solar:target-linear" className="text-orange-500/60 mt-0.5 shrink-0" width={14} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 leading-tight truncate">
                        {goal.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1d24] text-slate-500 border border-[#333a47]/40 font-mono">
                      P{goal.priority || '—'}
                    </span>
                    <span className="text-sm font-medium text-slate-400">{pct}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full progress-track p-0.5">
                  <div
                    className="h-full rounded-full progress-fill transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">{done}/{total} tasks</span>
                  <div className="flex items-center gap-1">
                    {tasks.slice(0, 5).map((t, i: number) => (
                      <span
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          t.status === 'done' || t.status === 'completed'
                            ? 'bg-emerald-400 shadow-[0_0_3px_rgba(52,211,153,0.6)]'
                            : 'bg-slate-700'
                        )}
                      />
                    ))}
                    {tasks.length > 5 && (
                      <span className="text-[10px] text-slate-600 ml-0.5">+{tasks.length - 5}</span>
                    )}
                  </div>
                </div>

                {goal.blockers?.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-red-400">
                    <Icon icon="solar:danger-circle-linear" width={12} />
                    <span>{goal.blockers.length} blocker{goal.blockers.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
