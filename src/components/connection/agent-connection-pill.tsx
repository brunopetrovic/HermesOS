'use client';

import { Icon } from '@iconify/react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { openAgentOnboarding } from '@/components/connection/agent-onboarding';
import type { AgentType } from '@/lib/agent-harnesses';
import { useConnection, useInvalidateConnection } from '@/lib/hooks/use-connection';

const agentIcons: Record<AgentType, string> = {
  hermes: 'solar:bolt-circle-linear',
  openclaw: 'solar:widget-5-linear',
  openai: 'solar:cloud-linear',
  http: 'solar:link-circle-linear',
  process: 'solar:terminal-linear',
  custom: 'solar:code-circle-linear',
};

export function AgentConnectionPill() {
  const { data, isLoading, isFetching } = useConnection();
  const invalidate = useInvalidateConnection();
  const [latency, setLatency] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinging, setPinging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const state = data ?? { connected: false, connection: null };
  const loading = isLoading || (isFetching && !data);

  async function pingGateway() {
    if (!state.connected || !state.connection?.gatewayUrl) {
      setLatency(null);
      return;
    }
    setPinging(true);
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('/api/connection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: state.connection.agentType,
          gatewayUrl: state.connection.gatewayUrl,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        setLatency(Date.now() - start);
      } else {
        setLatency(null);
      }
    } catch {
      setLatency(null);
    } finally {
      setPinging(false);
    }
  }

  async function disconnect() {
    setMenuOpen(false);
    try {
      await fetch('/api/connection', { method: 'DELETE' });
      invalidate();
    } catch {
      // Ignore
    }
  }

  // Periodic latency ping every 30s when connected
  useEffect(() => {
    if (state.connected) {
      pingGateway();
      const interval = setInterval(pingGateway, 30000);
      return () => clearInterval(interval);
    } else {
      setLatency(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.connected, state.connection?.gatewayUrl]);

  // Click outside menu listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const icon = state.connection?.agentType && state.connection.agentType in agentIcons
    ? agentIcons[state.connection.agentType as AgentType]
    : 'solar:plug-circle-linear';
  const connected = state.connected && state.connection;

  const handleClick = () => {
    if (connected) {
      setMenuOpen(!menuOpen);
    } else {
      openAgentOnboarding();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleClick}
        className={cn(
          'flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer',
          connected
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/45'
            : 'border-orange-500/25 bg-orange-500/10 text-orange-200 hover:border-orange-400/45'
        )}
        title={connected ? `${state.connection?.label} at ${state.connection?.gatewayUrl}` : 'Connect a local agent'}
      >
        <span className={cn(
          'h-2 w-2 rounded-full',
          loading ? 'animate-pulse bg-slate-500' : connected ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'
        )} />
        <Icon icon={icon} width={16} className="shrink-0" />
        <span className="max-w-[7rem] truncate sm:max-w-[10rem]">{connected ? state.connection?.label : 'Connect Agent'}</span>
        {connected && (
          <span className="hidden text-[10px] opacity-60 font-mono font-normal md:inline-block">
            {latency !== null ? `${latency}ms` : 'online'}
          </span>
        )}
        {connected && (
          <Icon icon="solar:alt-arrow-down-linear" width={12} className={cn("transition-transform duration-200", menuOpen && "rotate-180")} />
        )}
      </button>

      {/* Diagnostic drop-down menu */}
      {menuOpen && connected && (
        <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl border border-slate-800 bg-[#0e1117]/95 shadow-2xl backdrop-blur-md p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
            <p className="text-xs font-bold text-slate-200">{state.connection?.label}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{state.connection?.gatewayUrl}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[9px] rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/10">
                <span className="h-1 w-1 bg-emerald-400 rounded-full" />
                {state.connection?.agentType}
              </span>
              {latency !== null && (
                <span className="text-[9px] font-mono text-slate-400">
                  RTT: {latency}ms
                </span>
              )}
            </div>
          </div>

          <button
            onClick={pingGateway}
            disabled={pinging}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Icon icon="solar:refresh-linear" width={14} className={cn(pinging && "animate-spin")} />
            <span>Test Health / Ping</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              openAgentOnboarding();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Icon icon="solar:settings-linear" width={14} />
            <span>Configure Harness</span>
          </button>

          <div className="h-px bg-slate-800/50 my-1" />

          <button
            onClick={disconnect}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-medium"
          >
            <Icon icon="solar:logout-linear" width={14} />
            <span>Disconnect Gateway</span>
          </button>
        </div>
      )}
    </div>
  );
}
