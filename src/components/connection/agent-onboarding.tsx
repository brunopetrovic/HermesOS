'use client';

import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AgentType } from '@/lib/agent-harnesses';
import { defaultAdapterConfig, prettyJson } from './onboarding/copy';
import { ConfigureStep } from './onboarding/configure-step';
import { SyncStep } from './onboarding/sync-step';
import { TestStep } from './onboarding/test-step';
import { WelcomeStep } from './onboarding/welcome-step';
import { useConnection, useInvalidateConnection } from '@/lib/hooks/use-connection';
import {
  type Discovery,
  type MaskedConnection,
  EMPTY_FORM,
  type OnboardingForm,
  type TestResult,
} from './onboarding/types';

export function AgentOnboarding() {
  const { data, refetch } = useConnection();
  const invalidate = useInvalidateConnection();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<OnboardingForm>(EMPTY_FORM);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(1);

  const connected = data?.connected ?? false;
  const connection = data?.connection as MaskedConnection | null;
  const discovery = data?.discovery as Discovery | null;

  function hydrateFromConnection(payload: typeof data, options: { forceOpen?: boolean } = {}) {
    if (!payload) {
      setError('Could not load connection settings.');
      if (options.forceOpen) setOpen(true);
      return;
    }
    setError(null);
    const detectedHermes = payload.discovery?.detectedHomes.find(
      item => item.agentType === 'hermes' && item.exists
    );
    const firstPreset = payload.discovery?.presets[0];

    if (payload.connection) {
      setForm({
        agentType: payload.connection.agentType as AgentType,
        label: payload.connection.label,
        gatewayUrl: payload.connection.gatewayUrl,
        apiKey: '',
        homePath: payload.connection.homePath || '',
        adapterConfigJson: prettyJson(payload.connection.adapterConfig || defaultAdapterConfig(payload.connection.agentType as AgentType)),
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        gatewayUrl: firstPreset?.gatewayUrl || payload.discovery?.defaultGatewayUrl || EMPTY_FORM.gatewayUrl,
        homePath: detectedHermes?.path || '',
      });
    }

    if (options.forceOpen || !payload.connected) {
      setOpen(true);
      setWizardStep(payload.connected ? 4 : 1);
    }
  }

  useEffect(() => {
    void refetch().then(({ data: next }) => hydrateFromConnection(next));

    const openHandler = () => {
      void refetch().then(({ data: next }) => hydrateFromConnection(next, { forceOpen: true }));
    };
    window.addEventListener('open-agent-onboarding', openHandler);
    return () => window.removeEventListener('open-agent-onboarding', openHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPreset = useMemo(
    () => discovery?.presets.find(item => item.agentType === form.agentType) || null,
    [discovery, form.agentType]
  );
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
      label: preset?.label || current.label,
      gatewayUrl: preset?.gatewayUrl || current.gatewayUrl,
      homePath: home?.path || current.homePath || '',
      adapterConfigJson: prettyJson(defaultAdapterConfig(agentType, preset)),
    }));
    setTestResult(null);
    setError(null);
    setWizardStep(2);
  }

  function autofillFromEnv() {
    if (!selectedPreset) return;
    setForm(current => ({
      ...current,
      gatewayUrl: selectedPreset.gatewayUrl || current.gatewayUrl,
      homePath: detectedHome?.path || current.homePath || '',
    }));
  }

  async function testConnection() {
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      let adapterConfig: Record<string, unknown> = {};
      try {
        adapterConfig = form.adapterConfigJson.trim() ? JSON.parse(form.adapterConfigJson) : {};
      } catch {
        setError('Adapter config must be valid JSON.');
        setTesting(false);
        return;
      }
      const res = await fetch('/api/connection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: form.agentType,
          gatewayUrl: form.gatewayUrl,
          apiKey: form.apiKey || undefined,
          adapterConfig,
        }),
      });
      const data = (await res.json()) as TestResult;
      setTestResult(data);
      if (res.ok && data.ok) {
        setTimeout(() => setWizardStep(4), 1000);
      } else {
        setError(data.detail || 'Gateway test failed.');
      }
    } catch {
      setError('Gateway test failed before receiving a response.');
    } finally {
      setTesting(false);
    }
  }

  async function saveAndConnect() {
    setSaving(true);
    setError(null);
    try {
      let adapterConfig: Record<string, unknown> = {};
      try {
        adapterConfig = form.adapterConfigJson.trim() ? JSON.parse(form.adapterConfigJson) : {};
      } catch {
        setError('Adapter config must be valid JSON.');
        setSaving(false);
        return;
      }
      const res = await fetch('/api/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: form.agentType,
          label: form.label,
          gatewayUrl: form.gatewayUrl,
          apiKey: form.apiKey || undefined,
          homePath: form.homePath || undefined,
          adapterConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not save connection.');
      setOpen(false);
      invalidate();
      void refetch().then(({ data: next }) => hydrateFromConnection(next));
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
      setForm(EMPTY_FORM);
      setWizardStep(1);
      invalidate();
      void refetch().then(({ data: next }) => hydrateFromConnection(next));
    } catch {
      setError('Could not disconnect agent.');
    } finally {
      setSaving(false);
    }
  }

  function close() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-onboarding-title"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-0 backdrop-blur-lg sm:items-center sm:p-4"
    >
      <div className="max-h-[96dvh] w-full max-w-4xl overflow-y-auto rounded-t-[2.5rem] border border-[#2b3544]/60 bg-[#0c0e14] shadow-2xl transition-all duration-300 sm:rounded-[2rem] md:max-h-[90dvh]">

        <div className="sticky top-0 z-10 border-b border-[#202733]/50 bg-[#0c0e14]/95 p-5 backdrop-blur-md md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  Agent Connection Wizard
                </span>
                {connected && connection && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                )}
              </div>
              <h2 id="agent-onboarding-title" className="mt-2 text-xl font-black text-white md:text-3xl">
                Onboard Local Agent
              </h2>
            </div>
            <button
              onClick={close}
              aria-label="Close onboarding dialog"
              className="rounded-full bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-white transition"
            >
              <Icon icon="solar:close-circle-linear" width={20} aria-hidden="true" />
            </button>
          </div>

          <ol className="mt-6 flex items-center justify-between gap-2 px-1" aria-label="Onboarding progress">
            {[1, 2, 3, 4].map(step => {
              const label = step === 1 ? 'Select' : step === 2 ? 'Configure' : step === 3 ? 'Test' : 'Sync';
              return (
                <li key={step} className="flex-1" aria-current={wizardStep === step ? 'step' : undefined}>
                  <div
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      wizardStep >= step ? 'bg-orange-500' : 'bg-[#181d28]'
                    )}
                  />
                  <span className={cn(
                    'mt-1.5 block text-[10px] font-bold uppercase tracking-widest transition-colors',
                    wizardStep === step ? 'text-orange-400' : 'text-slate-600'
                  )}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-5 md:p-8">
          <AnimatePresence mode="wait">
            {wizardStep === 1 && (
              <WelcomeStep
                key="welcome"
                discovery={discovery}
                form={form}
                onSelect={applyPreset}
              />
            )}
            {wizardStep === 2 && (
              <ConfigureStep
                key="configure"
                form={form}
                selectedPreset={selectedPreset}
                onChange={setForm}
                onAutofill={autofillFromEnv}
                onBack={() => setWizardStep(1)}
                onNext={() => setWizardStep(3)}
              />
            )}
            {wizardStep === 3 && (
              <TestStep
                key="test"
                form={form}
                testing={testing}
                testResult={testResult}
                error={error}
                onBack={() => setWizardStep(2)}
                onTest={testConnection}
                onNext={() => setWizardStep(4)}
              />
            )}
            {wizardStep === 4 && (
              <SyncStep
                key="sync"
                form={form}
                connected={connected}
                saving={saving}
                error={error}
                onSave={saveAndConnect}
                onDisconnect={disconnect}
                onAdjust={() => setWizardStep(2)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-[#202733]/40 bg-slate-950/20 p-5 text-center text-[10px] text-slate-500">
          Settings are stored locally inside <code className="font-mono text-slate-400">~/.unox/connection.json</code>. No data is sent to external servers.
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
