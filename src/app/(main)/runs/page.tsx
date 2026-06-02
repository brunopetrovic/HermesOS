'use client';

import { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type RunEvent = { id: string; type: string; label: string; detail: string | null; severity: string; createdAt: string };

type AgentRun = {
  id: string;
  agentType: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  duration: number | null;
  tokenCount: number | null;
  cost: number | null;
  config: string | null;
  createdAt: string;
  events?: RunEvent[];
};

const statusColors = {
  queued: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
  running: 'border-amber-500/25 bg-amber-500/10 text-amber-400 animate-pulse',
  succeeded: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  failed: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
  cancelled: 'border-slate-600/30 bg-slate-600/10 text-slate-500',
};

const agentBadges = {
  hermes: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  openclaw: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  openai: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  custom: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

async function fetchRuns(status: string, agentType: string): Promise<AgentRun[]> {
  const query = new URLSearchParams();
  if (status !== 'all') query.set('status', status);
  if (agentType !== 'all') query.set('agentType', agentType);
  const res = await fetch(`/api/runs?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Runs fetch failed (HTTP ${res.status})`);
  return (await res.json()) as AgentRun[];
}

export default function RunsDashboard() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: runs = [], isLoading: loading } = useQuery({
    queryKey: ['runs', filterStatus, filterAgent],
    queryFn: () => fetchRuns(filterStatus, filterAgent),
    refetchInterval: 5000,
  });

  const triggerRun = useMutation({
    mutationFn: async () => {
      const connRes = await fetch('/api/connection');
      const connData = connRes.ok ? await connRes.json() : null;
      const agentType = connData?.connection?.agentType || 'hermes';
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          config: {
            title: 'Diagnostic Test Run',
            input: 'System validation heartbeat probe',
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!res.ok) throw new Error(`Trigger run failed (HTTP ${res.status})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
  });

  const handleTriggerTestRun = useCallback(() => {
    triggerRun.mutate();
  }, [triggerRun]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['runs'] });
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">Agent Run History</h2>
          <p className="text-xs text-slate-400 mt-1">Audit log and status control cockpit of all local agent actions.</p>
        </div>
        <Button
          onClick={handleTriggerTestRun}
          disabled={triggerRun.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide text-xs h-11 rounded-xl px-5 transition cursor-pointer self-start"
        >
          <Icon icon="solar:play-bold" className="mr-2" />
          {triggerRun.isPending ? 'Triggering...' : 'Trigger Diagnostic'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-[#0c0e12]/80 border border-slate-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <label htmlFor="runs-status-filter" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status:</label>
          <select
            id="runs-status-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#11141b] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="running">Running</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="runs-agent-filter" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agent:</label>
          <select
            id="runs-agent-filter"
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            className="bg-[#11141b] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Agents</option>
            <option value="hermes">Hermes</option>
            <option value="openclaw">OpenClaw</option>
            <option value="openai">OpenAI Api</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <button
          onClick={handleRefresh}
          aria-label="Refresh runs"
          className="ml-auto text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          <Icon icon="solar:refresh-linear" width={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full rounded-2xl skeleton" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0c0e12]/30 p-12 text-center max-w-lg mx-auto">
          <div className="inline-flex rounded-full bg-slate-900 p-4 border border-slate-800 text-slate-500 mb-4">
            <Icon icon="solar:routing-linear" width={32} />
          </div>
          <h3 className="font-bold text-slate-200">No Runs Found</h3>
          <p className="text-xs text-slate-400 mt-2">Trigger a diagnostic run above or sync your agent to start recording run audits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-[#0c0e12]/60">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="p-4 font-bold uppercase tracking-wider">Run ID</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Agent Type</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Duration</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Tokens</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Cost</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Executed At</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Latest Event</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {runs.map(run => (
                  <tr key={run.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-300">
                      <Link href={`/runs/${run.id}`} className="hover:text-orange-400 hover:underline">
                        {run.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider',
                        agentBadges[run.agentType as keyof typeof agentBadges] || 'bg-slate-900 border-slate-800 text-slate-400'
                      )}>
                        {run.agentType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider',
                        statusColors[run.status] || ''
                      )}>
                        {run.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {run.duration !== null ? `${(run.duration / 1000).toFixed(2)}s` : '—'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {run.tokenCount !== null ? run.tokenCount.toLocaleString() : '—'}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {run.cost !== null ? `$${run.cost.toFixed(5)}` : '—'}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-400 max-w-[220px]">
                      <span className="block truncate">{run.events?.at(-1)?.label || 'No structured events yet'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/runs/${run.id}`} aria-label={`View run ${run.id.slice(0, 8)}`}>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                          <Icon icon="solar:eye-linear" width={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {runs.map(run => (
              <div key={run.id} className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-300">#{run.id.slice(0, 8)}</span>
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider',
                    statusColors[run.status] || ''
                  )}>
                    {run.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Agent</p>
                    <p className="text-slate-300 font-medium capitalize mt-0.5">{run.agentType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Duration</p>
                    <p className="text-slate-300 font-medium mt-0.5">
                      {run.duration !== null ? `${(run.duration / 1000).toFixed(2)}s` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Cost</p>
                    <p className="text-slate-400 font-mono mt-0.5">
                      {run.cost !== null ? `$${run.cost.toFixed(5)}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Executed At</p>
                    <p className="text-slate-500 mt-0.5">
                      {new Date(run.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  <Link href={`/runs/${run.id}`} className="w-full">
                    <Button variant="secondary" className="w-full text-xs font-bold h-9 rounded-xl border-slate-800 hover:bg-slate-800">
                      <Icon icon="solar:eye-linear" className="mr-1.5" />
                      View Log Output
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
