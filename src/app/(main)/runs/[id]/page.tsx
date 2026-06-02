'use client';

import { use, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type RunEvent = { id: string; type: string; label: string; detail: string | null; severity: string; metadata: string | null; createdAt: string };

type AgentRun = {
  id: string;
  agentType: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  duration: number | null;
  tokenCount: number | null;
  cost: number | null;
  logs: string | null;
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

function formatConfig(config: string) {
  try {
    return JSON.stringify(JSON.parse(config), null, 2);
  } catch {
    return config;
  }
}

async function fetchRunDetail(id: string): Promise<AgentRun> {
  const res = await fetch(`/api/runs/${id}`);
  if (!res.ok) throw new Error(`Run fetch failed (HTTP ${res.status})`);
  return (await res.json()) as AgentRun;
}

export default function RunDetail(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [autoScroll, setAutoScroll] = useState(true);
  const queryClient = useQueryClient();

  const { data: run, isLoading: loading } = useQuery({
    queryKey: ['run', params.id],
    queryFn: () => fetchRunDetail(params.id),
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 2000 : false),
  });

  const cancelRun = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/runs/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Cancel failed (HTTP ${res.status})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['run', params.id] });
    },
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-xl skeleton" />
        <div className="h-72 w-full rounded-2xl skeleton" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="text-center py-12 space-y-4">
        <Icon icon="solar:shield-warning-linear" className="w-16 h-16 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Execution Run Not Found</h3>
        <p className="text-xs text-slate-400">The run record could not be located in the local database.</p>
        <Link href="/runs">
          <Button className="mt-2 bg-slate-900 border border-slate-800 text-slate-300">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div className="space-y-1">
          <Link href="/runs" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition">
            <Icon icon="solar:alt-arrow-left-linear" />
            Back to Run History
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Run Details</h2>
            <span className="font-mono text-xs text-slate-500">#{run.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {run.status === 'running' && (
            <Button
              onClick={() => cancelRun.mutate()}
              disabled={cancelRun.isPending}
              variant="ghost"
              className="border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold h-10 rounded-xl"
            >
              Cancel execution
            </Button>
          )}
          <span className={cn(
            'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider',
            statusColors[run.status] || ''
          )}>
            {run.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Agent Type</p>
          <p className="text-sm font-black text-white capitalize mt-1">{run.agentType}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Execution Duration</p>
          <p className="text-sm font-black text-white mt-1">
            {run.duration !== null ? `${(run.duration / 1000).toFixed(2)}s` : 'active...'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tokens Utilized</p>
          <p className="text-sm font-black text-white mt-1">
            {run.tokenCount !== null ? run.tokenCount.toLocaleString() : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Estimated Cost</p>
          <p className="text-sm font-black text-emerald-400 font-mono mt-1">
            {run.cost !== null ? `$${run.cost.toFixed(5)}` : '—'}
          </p>
        </div>
      </div>

      {run.config && (
        <div className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Icon icon="solar:programming-code-linear" />
            Parameters Context Snapshot
          </h3>
          <pre className="text-xs font-mono bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-slate-300 overflow-x-auto max-h-40 custom-scrollbar">
            {formatConfig(run.config)}
          </pre>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-[#0c0e12]/60 p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Icon icon="solar:route-linear" />
          Structured Execution Timeline
        </h3>
        {run.events?.length ? (
          <ol className="space-y-3">
            {run.events.map((event) => (
              <li key={event.id} className="flex gap-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                <span className={cn(
                  'mt-1 h-2.5 w-2.5 rounded-full shrink-0',
                  event.severity === 'success' ? 'bg-emerald-400' : event.severity === 'error' ? 'bg-rose-400' : event.severity === 'warning' ? 'bg-amber-400' : 'bg-slate-500'
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-slate-200">{event.label}</p>
                    <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[9px] uppercase tracking-wider text-slate-500">{event.type}</span>
                    <span className="text-[10px] text-slate-600">{new Date(event.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {event.detail && <p className="mt-1 text-xs leading-relaxed text-slate-500">{event.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-500">No structured events have been recorded for this run yet.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-black overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-[#0b0c10] border-b border-slate-900 px-4 py-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-[10px] font-mono text-slate-500 tracking-wider ml-2">TERMINAL LOG OUTPUT</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={e => setAutoScroll(e.target.checked)}
                aria-label="Toggle auto-scroll"
                className="accent-orange-500"
              />
              AUTO-SCROLL
            </label>
            <button
              onClick={() => {
                if (run.logs) navigator.clipboard.writeText(run.logs);
              }}
              className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-900 rounded-lg transition"
              title="Copy all logs"
              aria-label="Copy all logs"
            >
              <Icon icon="solar:copy-linear" width={14} />
            </button>
          </div>
        </div>

        <div
          className="p-4 md:p-6 font-mono text-xs text-orange-200/90 bg-[#07080a] min-h-[16rem] max-h-[30rem] overflow-y-auto leading-relaxed whitespace-pre-wrap select-text custom-scrollbar"
          role="log"
          aria-live={autoScroll ? 'polite' : 'off'}
          aria-label="Run log output"
        >
          {run.logs || '[No logs generated yet]'}
        </div>
      </div>
    </div>
  );
}
