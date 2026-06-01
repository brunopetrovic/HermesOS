'use client';

import { Icon } from '@iconify/react';

export default function GoalsPage() {
  return (
    <>
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <Icon icon="solar:target-linear" className="text-orange-500 glow-orange" width={22} />
        <div>
          <h1 className="text-lg font-medium text-slate-200">Goals</h1>
          <p className="text-xs text-slate-500">Track progress toward your objectives</p>
        </div>
      </div>

      {/* Main Goal */}
      <div className="px-2 animate-slide-up stagger-2">
        <div className="bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Icon icon="solar:crown-linear" className="text-orange-500" width={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-200">Primary Objective</h2>
              <p className="text-xs text-slate-500">Your top-level goal</p>
            </div>
          </div>
          <div className="w-full bg-[#1a1d24] rounded-full h-3 mb-2">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full" style={{ width: '0%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="px-2 animate-slide-up stagger-3">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Milestones</h2>
        <div className="space-y-3">
          <MilestoneCard title="First $1 Revenue" status="pending" description="Generate first dollar" />
          <MilestoneCard title="$1K MRR" status="pending" description="Monthly recurring revenue" />
          <MilestoneCard title="$10K MRR" status="pending" description="Sustainable income" />
          <MilestoneCard title="$100K MRR" status="pending" description="Business validated" />
          <MilestoneCard title="$1M MRR" status="pending" description="Scale operations" />
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="px-2 animate-slide-up stagger-4">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Today's Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Revenue" value="$0" icon="solar:wallet-money-linear" />
          <MetricCard label="Outreach" value="0" icon="solar:letter-linear" />
          <MetricCard label="Replies" value="0" icon="solar:chat-round-linear" />
          <MetricCard label="Experiments" value="0" icon="solar:test-tube-linear" />
        </div>
      </div>

      {/* Sub-Goals */}
      <div className="px-2 animate-slide-up stagger-5">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Active Sub-Goals</h2>
        <div className="space-y-2">
          <SubGoalCard title="Set up revenue autoresearch" status="completed" />
          <SubGoalCard title="Find first 10 potential customers" status="in_progress" />
          <SubGoalCard title="Book first customer conversation" status="pending" />
          <SubGoalCard title="Validate first problem" status="pending" />
          <SubGoalCard title="Get first paying customer" status="pending" />
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
        <p className="text-[10px] text-slate-500">{description}</p>
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
