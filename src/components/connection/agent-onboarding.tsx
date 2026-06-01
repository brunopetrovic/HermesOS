'use client';

import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AgentType = 'hermes' | 'openclaw' | 'custom';

type MaskedConnection = {
  agentType: AgentType;
  label: string;
  gatewayUrl: string;
  homePath?: string;
  connectedAt?: string;
  hasApiKey?: boolean;
  apiKeyPreview?: string | null;
};

type Discovery = {
  defaultGatewayUrl: string;
  detectedHomes: { agentType: AgentType; path: string; exists: boolean; source: string }[];
  presets: { agentType: AgentType; label: string; gatewayUrl: string; description: string }[];
};

type ConnectionResponse = {
  connected: boolean;
  connection: MaskedConnection | null;
  discovery?: Discovery;
};

type TestResult = {
  ok: boolean;
  status: number | null;
  detail: string;
  checkedEndpoint?: string;
};

const EMPTY_FORM = {
  agentType: 'hermes' as AgentType,
  label: 'Hermes Agent',
  gatewayUrl: 'http://localhost:8642',
  apiKey: '',
  homePath: '',
};

const AGENT_COPY: Record<AgentType, { title: string; helper: string; icon: string }> = {
  hermes: {
    title: 'Hermes Agent',
    helper: 'Best default for Hermes Agent gateway installs. Reads local memory, skills, crons, sessions, and status when the home path is available.',
    icon: 'solar:bolt-circle-linear',
  },
  openclaw: {
    title: 'OpenClaw / Claw-compatible',
    helper: 'Use when your local agent exposes an HTTP gateway or command-center API. Keep it localhost-bound unless you intentionally proxy it.',
    icon: 'solar:widget-5-linear',
  },
  custom: {
    title: 'Custom OpenAI-compatible gateway',
    helper: 'For Ollama, LM Studio, custom agents, or any local gateway that responds on /health, /v1/models, /api/status, or root.',
    icon: 'solar:code-circle-linear',
  },
};

export function AgentOnboarding() {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState<MaskedConnection | null>(null);
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshConnection(options: { forceOpen?: boolean } = {}) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connection', { cache: 'no-store' });
      const data = (await res.json()) as ConnectionResponse;
      setConnected(data.connected);
      setConnection(data.connection);
      setDiscovery(data.discovery || null);

      const detectedHermes = data.discovery?.detectedHomes.find(
        item => item.agentType === 'hermes' && item.exists
      );
      const firstPreset = data.discovery?.presets[0];

      if (data.connection) {
        setForm({
          agentType: data.connection.agentType,
          label: data.connection.label,
          gatewayUrl: data.connection.gatewayUrl,
          apiKey: '',
          homePath: data.connection.homePath || '',
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          gatewayUrl: firstPreset?.gatewayUrl || data.discovery?.defaultGatewayUrl || EMPTY_FORM.gatewayUrl,
          homePath: detectedHermes?.path || '',
        });
      }

      if (options.forceOpen || !data.connected) setOpen(true);
    } catch {
      setError('Could not load connection settings.');
      if (options.forceOpen) setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshConnection();

    const openHandler = () => refreshConnection({ forceOpen: true });
    window.addEventListener('open-agent-onboarding', openHandler);
    return () => window.removeEventListener('open-agent-onboarding', openHandler);
  }, []);

  const selectedCopy = AGENT_COPY[form.agentType];
  const detectedHome = useMemo(
    () => discovery?.detectedHomes.find(item => item.agentType === form.agentType && item.exists),
    [discovery, form.agentType]
  );

  function applyPreset(agentType: AgentType) {
    const preset = discovery?.presets.find(item => item.agentType === agentType);
    const home = discovery?.detectedHomes.find(item => item.agentType === agentType && item.exists);
    setForm(current => ({
      ...current,
      agentType,
      label: preset?.label || AGENT_COPY[agentType].title,
      gatewayUrl: preset?.gatewayUrl || current.gatewayUrl,
      homePath: home?.path || current.homePath,
    }));
    setTestResult(null);
    setError(null);
  }

  async function testConnection() {
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      const res = await fetch('/api/connection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayUrl: form.gatewayUrl, apiKey: form.apiKey || undefined }),
      });
      const data = (await res.json()) as TestResult;
      setTestResult(data);
      if (!res.ok || !data.ok) setError(data.detail || 'Gateway test failed.');
    } catch {
      setError('Gateway test failed before receiving a response.');
    } finally {
      setTesting(false);
    }
  }

  async function saveConnection() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: form.agentType,
          label: form.label,
          gatewayUrl: form.gatewayUrl,
          apiKey: form.apiKey || undefined,
          homePath: form.homePath || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not save connection.');
      setConnected(true);
      setConnection(data.connection);
      setOpen(false);
      window.dispatchEvent(new Event('agent-connection-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save connection.');
    } finally {
      setSaving(false);
    }
  }

  async function disconnect() {
    setSaving(true);
    setError(null);
    try {
      await fetch('/api/connection', { method: 'DELETE' });
      setConnected(false);
      setConnection(null);
      setOpen(true);
      window.dispatchEvent(new Event('agent-connection-updated'));
    } catch {
      setError('Could not disconnect agent.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div className="max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-[#333a47]/70 bg-[#11141a] shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#333a47]/40 bg-[#11141a]/95 p-4 backdrop-blur md:p-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
                Local agent setup
              </span>
              {connected && connection ? (
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Connected: {connection.label}
                </span>
              ) : null}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-4xl">
              Connect HermesOS to your local agent
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
              HermesOS stays clean by default: no bundled personal paths, no hidden cloud dependency, no exposed secrets. Pick an agent, test its gateway, then sync local status, memory, skills, crons, sessions, and future tools through one saved connection.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-[#333a47]/60 bg-[#1a1d24] p-2 text-slate-400 transition hover:text-white"
            aria-label="Close agent setup"
          >
            <Icon icon="solar:close-circle-linear" width={22} />
          </button>
        </div>

        <div className="grid gap-5 p-4 md:grid-cols-[0.85fr_1.15fr] md:p-6">
          <section className="space-y-3">
            <h3 className="px-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Agent preset</h3>
            {(['hermes', 'openclaw', 'custom'] as AgentType[]).map(agentType => {
              const copy = AGENT_COPY[agentType];
              const isSelected = form.agentType === agentType;
              return (
                <button
                  key={agentType}
                  onClick={() => applyPreset(agentType)}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition',
                    isSelected
                      ? 'border-orange-500/50 bg-orange-500/10 shadow-[0_0_24px_rgba(249,115,22,0.08)]'
                      : 'border-[#333a47]/40 bg-[#0d1015] hover:border-[#333a47]/80'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-xl p-2', isSelected ? 'bg-orange-500/15 text-orange-300' : 'bg-[#1a1d24] text-slate-400')}>
                      <Icon icon={copy.icon} width={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-100">{copy.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{copy.helper}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="rounded-2xl border border-[#333a47]/35 bg-[#0d1015] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <Icon icon="solar:radar-2-linear" width={15} />
                Auto-detection
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-400">
                {loading ? <p>Scanning local defaults…</p> : null}
                {discovery?.detectedHomes.filter(item => item.exists).length ? (
                  discovery.detectedHomes.filter(item => item.exists).map(item => (
                    <button
                      key={`${item.agentType}-${item.path}`}
                      onClick={() => setForm(current => ({ ...current, agentType: item.agentType, homePath: item.path }))}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-left text-emerald-200"
                    >
                      <span className="truncate">{item.path}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-widest">{item.agentType}</span>
                    </button>
                  ))
                ) : !loading ? (
                  <p>No local agent home detected yet. That’s fine — gateway-only mode still works.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-[#333a47]/40 bg-[#0d1015] p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/10 p-2 text-orange-300">
                <Icon icon={selectedCopy.icon} width={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCopy.title}</h3>
                <p className="text-xs text-slate-500">Configuration is saved locally on this machine.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Display label</span>
                <input
                  value={form.label}
                  onChange={e => setForm(current => ({ ...current, label: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#333a47]/60 bg-[#11141a] px-3 text-sm text-slate-100 outline-none transition focus:border-orange-500/60"
                  placeholder="My local agent"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Gateway URL</span>
                <input
                  value={form.gatewayUrl}
                  onChange={e => {
                    setForm(current => ({ ...current, gatewayUrl: e.target.value }));
                    setTestResult(null);
                  }}
                  className="h-11 w-full rounded-xl border border-[#333a47]/60 bg-[#11141a] px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-orange-500/60"
                  placeholder="http://localhost:8642"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">API key / bearer token</span>
                <input
                  value={form.apiKey}
                  onChange={e => setForm(current => ({ ...current, apiKey: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#333a47]/60 bg-[#11141a] px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-orange-500/60"
                  placeholder={connection?.hasApiKey ? connection.apiKeyPreview || 'Saved token present' : 'Optional'}
                  type="password"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Local agent home path</span>
                <input
                  value={form.homePath}
                  onChange={e => setForm(current => ({ ...current, homePath: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-[#333a47]/60 bg-[#11141a] px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-orange-500/60"
                  placeholder="~/.hermes or ~/.openclaw-workspace"
                />
              </label>
            </div>

            {detectedHome ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                Detected {form.agentType} home: <span className="font-mono">{detectedHome.path}</span>
              </div>
            ) : null}

            {testResult ? (
              <div className={cn(
                'rounded-xl border px-3 py-2 text-xs',
                testResult.ok ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-red-500/25 bg-red-500/10 text-red-200'
              )}>
                <span className="font-bold">{testResult.ok ? 'Gateway reachable' : 'Gateway not ready'}:</span>{' '}
                {testResult.detail}
                {testResult.checkedEndpoint ? <span className="ml-1 font-mono text-[11px] opacity-80">({testResult.checkedEndpoint})</span> : null}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <Button onClick={testConnection} loading={testing} variant="secondary" className="w-full">
                Test gateway
              </Button>
              <Button onClick={saveConnection} loading={saving} className="w-full sm:col-span-2" disabled={!form.gatewayUrl || !form.label}>
                Save & sync agent
              </Button>
            </div>

            {connected ? (
              <button
                onClick={disconnect}
                disabled={saving}
                className="w-full rounded-xl border border-red-500/25 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                Disconnect saved agent
              </button>
            ) : null}

            <div className="grid gap-3 rounded-2xl border border-[#333a47]/35 bg-[#11141a] p-4 text-xs leading-relaxed text-slate-400 md:grid-cols-3">
              <div>
                <p className="mb-1 font-bold text-slate-200">1. Keep it local</p>
                <p>Default to localhost. If you expose the gateway, put auth and a private network in front of it.</p>
              </div>
              <div>
                <p className="mb-1 font-bold text-slate-200">2. Sync data safely</p>
                <p>Home path unlocks memory, sessions, skills, crons, and file-backed status. Gateway-only still enables chat/control surfaces.</p>
              </div>
              <div>
                <p className="mb-1 font-bold text-slate-200">3. Desktop-ready later</p>
                <p>This flow maps cleanly to a future Linux, Windows, and macOS shell without user-specific defaults.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function openAgentOnboarding() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('open-agent-onboarding'));
  }
}
