'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { FuelGauge } from '@/components/dashboard/fuel-gauge';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@/lib/hooks/use-connection';
import { ConnectionRequiredState, ErrorState } from '@/components/ui/state';

type DashboardStats = {
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  activeGoals: number;
  totalSyncs: number;
  budgetLimit: number;
  costLimit: number;
};

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
  if (!res.ok) {
    return { totalRuns: 0, totalTokens: 0, totalCost: 0, activeGoals: 0, totalSyncs: 0, budgetLimit: 5000000, costLimit: 5.0 };
  }
  return res.json();
}

type SetupStep = { id: string; label: string; complete: boolean; detail: string };
type SetupStatus = { ready: boolean; steps: SetupStep[]; gateway: { ok: boolean; detail: string } };

async function fetchSetupStatus(): Promise<SetupStatus> {
  const res = await fetch('/api/setup/status', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Setup status failed (HTTP ${res.status})`);
  return res.json();
}

const DEFAULT_STATS: DashboardStats = {
  totalRuns: 0,
  totalTokens: 0,
  totalCost: 0,
  activeGoals: 0,
  totalSyncs: 0,
  budgetLimit: 5000000,
  costLimit: 5.0,
};

export default function DashboardPage() {
  const { data: statsData, isLoading: loading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
  });
  const { data: setupStatus, error: setupError, refetch: refetchSetup } = useQuery({
    queryKey: ['setup', 'status'],
    queryFn: fetchSetupStatus,
    refetchInterval: 15_000,
  });
  const { data: connData } = useConnection();

  const stats = statsData ?? DEFAULT_STATS;
  const conn: ConnectionStatus = connData?.connected && connData.connection
    ? {
        ok: true,
        label: connData.connection.label,
        agentType: connData.connection.agentType,
        detail: `Active gateway: ${connData.connection.gatewayUrl}`,
      }
    : { ok: false, label: 'Disconnected', agentType: 'none', detail: 'No local agent gateway connected.' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <div className="rounded-xl bg-orange-500/10 p-2 border border-orange-500/20 text-orange-500">
          <Icon icon="solar:home-2-linear" className="glow-orange" width={22} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Mission Control</h1>
          <p className="text-xs text-slate-500">Universal command cockpit overview</p>
        </div>
      </div>

      {setupError && (
        <ErrorState
          title="Setup status unavailable"
          detail={(setupError as Error).message}
          onRetry={() => void refetchSetup()}
        />
      )}

      {setupStatus && !setupStatus.ready && (
        <div className="mx-2 rounded-2xl border border-border bg-surface/70 p-5 space-y-4 animate-slide-up stagger-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-black text-text-primary">First-run activation</h2>
              <p className="mt-1 text-xs text-text-secondary">Complete these checks to unlock the full live agent cockpit.</p>
            </div>
            {!setupStatus.gateway.ok && (
              <button
                onClick={() => window.dispatchEvent(new Event('open-agent-onboarding'))}
                className="h-10 rounded-xl bg-accent px-4 text-xs font-black text-bg-primary transition hover:brightness-110 active:scale-[0.98]"
              >
                Configure agent
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {setupStatus.steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-bg-secondary/60 p-3">
                <Icon
                  icon={step.complete ? 'solar:check-circle-bold' : 'solar:clock-circle-linear'}
                  className={step.complete ? 'text-success' : 'text-warning'}
                  width={18}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary">{step.label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-text-secondary">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!conn.ok && (
        <ConnectionRequiredState onConnect={() => window.dispatchEvent(new Event('open-agent-onboarding'))} />
      )}

      <div className="px-2 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-2">
        <StatCard
          icon="solar:target-linear"
          label="Active Goals"
          value={loading ? '...' : String(stats.activeGoals)}
          subtitle="Target milestones"
          color="orange"
        />
        <StatCard
          icon="solar:routing-linear"
          label="Agent Executions"
          value={loading ? '...' : String(stats.totalRuns)}
          subtitle="Total recorded runs"
          color="green"
        />
        <StatCard
          icon="solar:refresh-circle-linear"
          label="Sync Logs"
          value={loading ? '...' : String(stats.totalSyncs)}
          subtitle="Database sync events"
          color="blue"
        />
        <StatCard
          icon="solar:wallet-money-linear"
          label="LLM Resource Cost"
          value={loading ? '...' : `$${stats.totalCost.toFixed(4)}`}
          subtitle="Est. cumulative spend"
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 px-2">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard href="/una" icon="solar:chat-round-linear" label="Chat with Una" desc="Interact with the assistant orb" />
              <ActionCard href="/runs" icon="solar:play-bold" label="Operations Cockpit" desc="Inspect agent execution logs" />
              <ActionCard href="/goals" icon="solar:target-linear" label="Track Goals" desc="Add and manage core objectives" />
              <ActionCard href="/brain/memories" icon="solar:cpu-bolt-linear" label="Memory Graph" desc="Edit L1 working memory context" />
            </div>
          </div>

          <div className="bg-[#161920]/60 border border-[#333a47]/20 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#333a47]/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Icon icon="solar:server-square-linear" />
                Active Gateway Info
              </h3>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                conn.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', conn.ok ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400')} />
                {conn.ok ? 'Online' : 'Config Required'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
              <div>
                <p className="text-sm font-bold text-white">{conn.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{conn.detail}</p>
              </div>
              {!conn.ok && (
                <button
                  onClick={() => window.dispatchEvent(new Event('open-agent-onboarding'))}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold h-10 px-4 rounded-xl transition shrink-0 cursor-pointer"
                >
                  Connect Agent
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Resource Monitor</h2>
          <FuelGauge
            usedTokens={stats.totalTokens}
            limitTokens={stats.budgetLimit}
            usedCost={stats.totalCost}
            limitCost={stats.costLimit}
          />
        </div>
      </div>
    </div>
  );
}

type ConnectionStatus = {
  ok: boolean;
  label: string;
  agentType: string;
  detail: string;
};

function StatCard({ icon, label, value, subtitle, color }: {
  icon: string; label: string; value: string; subtitle: string; color: string;
}) {
  const colorClasses: Record<string, string> = {
    orange: 'text-orange-500',
    green: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="bg-[#161920]/60 rounded-2xl p-5 border border-[#333a47]/20 hover:border-orange-500/10 transition duration-300">
      <Icon icon={icon} className={colorClasses[color]} width={22} />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-3">{label}</p>
      <p className="text-xl md:text-2xl font-black text-slate-200 mt-1 tracking-tight">{value}</p>
      <p className="text-[10px] text-slate-600 mt-0.5">{subtitle}</p>
    </div>
  );
}

function ActionCard({ href, icon, label, desc }: { href: string; icon: string; label: string; desc?: string }) {
  return (
    <Link
      href={href}
      className="bg-[#161920]/60 rounded-2xl p-5 border border-[#333a47]/20 hover:border-orange-500/30 hover:bg-[#1a1e28]/70 transition duration-300 flex items-start gap-4"
    >
      <div className="rounded-xl bg-[#0c0e12] p-2.5 border border-slate-800 text-slate-400 group-hover:text-orange-500 transition-colors">
        <Icon icon={icon} width={20} />
      </div>
      <div>
        <span className="text-sm font-bold text-slate-200 block">{label}</span>
        {desc && <span className="text-[10px] text-slate-500 block mt-0.5">{desc}</span>}
      </div>
    </Link>
  );
}
