'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <Icon icon="solar:home-2-linear" className="text-orange-500 glow-orange" width={22} />
        <div>
          <h1 className="text-lg font-medium text-slate-200">Mission Control</h1>
          <p className="text-xs text-slate-500">Command center overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-2 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-2">
        <StatCard
          icon="solar:target-linear"
          label="Goal Progress"
          value="$0"
          subtitle="→ $1B"
          color="orange"
        />
        <StatCard
          icon="solar:wallet-money-linear"
          label="Revenue Score"
          value="20.0"
          subtitle="Baseline"
          color="green"
        />
        <StatCard
          icon="solar:users-group-rounded-linear"
          label="Customers"
          value="0"
          subtitle="First needed"
          color="blue"
        />
        <StatCard
          icon="solar:notebook-bookmark-linear"
          label="Wiki Pages"
          value="32"
          subtitle="Growing"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="px-2 animate-slide-up stagger-3">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionCard href="/una" icon="solar:chat-round-linear" label="Chat with Una" />
          <ActionCard href="/revenue" icon="solar:wallet-money-linear" label="Run Experiments" />
          <ActionCard href="/customers" icon="solar:users-group-rounded-linear" label="Find Customers" />
          <ActionCard href="/goals" icon="solar:target-linear" label="Track Goals" />
        </div>
      </div>

      {/* System Status */}
      <div className="px-2 animate-slide-up stagger-4">
        <h2 className="text-sm font-medium text-slate-400 mb-3">System Status</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatusCard
            title="Core Skills"
            value="16"
            subtitle="All active"
            icon="solar:widget-linear"
            status="good"
          />
          <StatusCard
            title="Cron Jobs"
            value="3"
            subtitle="Running on schedule"
            icon="solar:clock-circle-linear"
            status="good"
          />
          <StatusCard
            title="Email"
            value="1"
            subtitle="Gmail connected"
            icon="solar:letter-linear"
            status="warning"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-2 animate-slide-up stagger-5">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Recent Activity</h2>
        <div className="space-y-2">
          <ActivityItem
            icon="solar:server-square-linear"
            text="System setup completed — 16 core skills configured"
            time="Today"
          />
          <ActivityItem
            icon="solar:wallet-money-linear"
            text="Revenue autoresearch initialized — first experiment scored 20.0"
            time="Today"
          />
          <ActivityItem
            icon="solar:notebook-bookmark-linear"
            text="Wiki expanded to 32 pages with Obsidian integration"
            time="Today"
          />
          <ActivityItem
            icon="solar:users-group-rounded-linear"
            text="Customer discovery skill created — ready for outreach"
            time="Today"
          />
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, subtitle, color }: {
  icon: string; label: string; value: string; subtitle: string; color: string;
}) {
  const colorClasses: Record<string, string> = {
    orange: 'text-orange-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="bg-[#161920] rounded-xl p-4 border border-[#333a47]/20">
      <Icon icon={icon} className={colorClasses[color]} width={20} />
      <p className="text-xs text-slate-500 mt-2">{label}</p>
      <p className="text-xl font-bold text-slate-200 mt-1">{value}</p>
      <p className="text-[10px] text-slate-600">{subtitle}</p>
    </div>
  );
}

function ActionCard({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="bg-[#161920] rounded-xl p-4 border border-[#333a47]/20 hover:border-orange-500/30 transition-colors flex items-center gap-3"
    >
      <Icon icon={icon} className="text-slate-400" width={18} />
      <span className="text-sm text-slate-300">{label}</span>
    </Link>
  );
}

function StatusCard({ title, value, subtitle, icon, status }: {
  title: string; value: string; subtitle: string; icon: string; status: 'good' | 'warning' | 'error';
}) {
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className="bg-[#161920] rounded-xl p-4 border border-[#333a47]/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={icon} className="text-slate-400" width={16} />
          <span className="text-xs text-slate-500">{title}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      </div>
      <p className="text-lg font-bold text-slate-200 mt-2">{value}</p>
      <p className="text-[10px] text-slate-600">{subtitle}</p>
    </div>
  );
}

function ActivityItem({ icon, text, time }: { icon: string; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#161920] rounded-xl border border-[#333a47]/20">
      <Icon icon={icon} className="text-slate-500" width={16} />
      <p className="text-xs text-slate-300 flex-1">{text}</p>
      <p className="text-[10px] text-slate-600">{time}</p>
    </div>
  );
}
