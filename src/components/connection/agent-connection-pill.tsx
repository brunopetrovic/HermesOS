'use client';

import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { openAgentOnboarding } from '@/components/connection/agent-onboarding';

type ConnectionState = {
  connected: boolean;
  connection: null | {
    agentType: 'hermes' | 'openclaw' | 'custom';
    label: string;
    gatewayUrl: string;
    hasApiKey?: boolean;
  };
};

const agentIcons = {
  hermes: 'solar:bolt-circle-linear',
  openclaw: 'solar:widget-5-linear',
  custom: 'solar:code-circle-linear',
};

export function AgentConnectionPill() {
  const [state, setState] = useState<ConnectionState>({ connected: false, connection: null });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch('/api/connection', { cache: 'no-store' });
      const data = await res.json();
      setState({ connected: Boolean(data.connected), connection: data.connection || null });
    } catch {
      setState({ connected: false, connection: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    window.addEventListener('agent-connection-updated', refresh);
    return () => window.removeEventListener('agent-connection-updated', refresh);
  }, []);

  const icon = state.connection?.agentType ? agentIcons[state.connection.agentType] : 'solar:plug-circle-linear';
  const connected = state.connected && state.connection;

  return (
    <button
      onClick={openAgentOnboarding}
      className={cn(
        'hidden min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition md:flex',
        connected
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/45'
          : 'border-orange-500/25 bg-orange-500/10 text-orange-200 hover:border-orange-400/45'
      )}
      title={connected ? `${state.connection?.label} at ${state.connection?.gatewayUrl}` : 'Connect a local agent'}
    >
      <span className={cn('h-2 w-2 rounded-full', loading ? 'animate-pulse bg-slate-500' : connected ? 'bg-emerald-400' : 'bg-orange-400')} />
      <Icon icon={icon} width={16} className="shrink-0" />
      <span className="max-w-[10rem] truncate">{connected ? state.connection?.label : 'Connect Agent'}</span>
    </button>
  );
}
