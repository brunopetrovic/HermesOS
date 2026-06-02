'use client';

import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { useGoalsStore } from '@/lib/store/goals-store';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

type MilestoneDto = {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string | null;
};

type GoalDto = {
  id: string;
  title: string;
  description?: string | null;
  progress: number;
  status: string;
  deadline?: string | null;
  milestones?: MilestoneDto[];
  instance?: { key: 'personal' | 'brand' | 'business' };
};

async function fetchGoals(): Promise<GoalDto[]> {
  const res = await fetch('/api/goals', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Goals load failed (HTTP ${res.status})`);
  return (await res.json()) as GoalDto[];
}

export default function GoalsPage() {
  const { setGoals } = useGoalsStore();
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const data = await fetchGoals();
      setGoals(data as never);
      return data;
    },
  });

  const primary = useMemo(() => goals[0], [goals]);
  const allMilestones = useMemo(
    () => (primary?.milestones || []).slice().sort((a, b) => Number(a.done) - Number(b.done)),
    [primary]
  );
  const subGoals = useMemo(
    () => goals.filter((g) => g.id !== primary?.id).slice(0, 5),
    [goals, primary]
  );

  const metrics = useMemo(
    () => [
      { label: 'Goals', value: String(goals.length), icon: 'solar:target-linear' },
      { label: 'Active', value: String(goals.filter((g) => g.status === 'active').length), icon: 'solar:play-circle-linear' },
      { label: 'Milestones', value: String(allMilestones.length), icon: 'solar:checklist-linear' },
      { label: 'Completed', value: String(allMilestones.filter((m) => m.done).length), icon: 'solar:check-circle-linear' },
    ],
    [goals, allMilestones]
  );

  return (
    <>
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <Icon icon="solar:target-linear" className="text-orange-500 glow-orange" width={22} />
        <div>
          <h1 className="text-lg font-medium text-slate-200">Goals</h1>
          <p className="text-xs text-slate-500">Track progress toward your objectives</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5 p-3 text-red-300 text-xs mx-2">{(error as Error).message}</Card>
      )}

      <div className="px-2 animate-slide-up stagger-2">
        <div className="bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Icon icon="solar:crown-linear" className="text-orange-500" width={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-200">Primary Objective</h2>
              <p className="text-xs text-slate-500">
                {primary ? primary.title : isLoading ? 'Loading…' : 'No primary goal yet'}
              </p>
            </div>
          </div>
          <div className="w-full bg-[#1a1d24] rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, primary?.progress || 0))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{primary?.progress ?? 0}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="px-2 animate-slide-up stagger-3">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Milestones</h2>
        <div className="space-y-3">
          {allMilestones.length === 0 && !isLoading && (
            <p className="text-xs text-slate-500 px-2">No milestones yet. Add one to a goal to start tracking.</p>
          )}
          {allMilestones.map((m) => (
            <MilestoneCard
              key={m.id}
              title={m.title}
              status={m.done ? 'completed' : 'pending'}
              description={m.dueDate ? new Date(m.dueDate).toLocaleDateString() : ''}
            />
          ))}
        </div>
      </div>

      <div className="px-2 animate-slide-up stagger-4">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Today&apos;s Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} />
          ))}
        </div>
      </div>

      <div className="px-2 animate-slide-up stagger-5">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Active Sub-Goals</h2>
        <div className="space-y-2">
          {subGoals.length === 0 && !isLoading && (
            <p className="text-xs text-slate-500 px-2">No sub-goals yet.</p>
          )}
          {subGoals.map((g) => (
            <SubGoalCard
              key={g.id}
              title={g.title}
              status={g.status === 'completed' ? 'completed' : g.status === 'paused' ? 'in_progress' : 'pending'}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function MilestoneCard({ title, status, description }: { title: string; status: string; description: string }) {
  const statusColors: Record<string, string> = {
    completed: 'bg-green-500',
    in_progress: 'bg-orange-500',
    pending: 'bg-slate-600',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-[#161920] rounded-xl border border-[#333a47]/20">
      <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        {description && <p className="text-[10px] text-slate-500">{description}</p>}
      </div>
      <span className="text-[10px] text-slate-600 uppercase">{status.replace('_', ' ')}</span>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-[#161920] rounded-xl p-4 border border-[#333a47]/20">
      <Icon icon={icon} className="text-slate-500" width={16} />
      <p className="text-xl font-bold text-slate-200 mt-2">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function SubGoalCard({ title, status }: { title: string; status: string }) {
  const statusIcons: Record<string, string> = {
    completed: 'solar:check-circle-bold',
    in_progress: 'solar:play-circle-linear',
    pending: 'solar:clock-circle-linear',
  };
  const statusColors: Record<string, string> = {
    completed: 'text-green-500',
    in_progress: 'text-orange-500',
    pending: 'text-slate-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[#161920] rounded-xl border border-[#333a47]/20">
      <Icon icon={statusIcons[status]} className={statusColors[status]} width={18} />
      <p className="text-sm text-slate-300">{title}</p>
    </div>
  );
}
