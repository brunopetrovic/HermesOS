'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AGENT_COPY } from './copy';
import type { OnboardingForm, PresetClientShape } from './types';

export function ConfigureStep({
  form,
  selectedPreset,
  onChange,
  onAutofill,
  onBack,
  onNext,
}: {
  form: OnboardingForm;
  selectedPreset: PresetClientShape | null;
  onChange: (next: OnboardingForm) => void;
  onAutofill: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const copy = AGENT_COPY[form.agentType];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-200">Step 2: Configure Connection</h3>
          <p className="text-xs text-slate-400 mt-1">Specify how HermesOS should talk to your local {copy.title} process.</p>
        </div>
        <Button
          onClick={onAutofill}
          variant="secondary"
          className="self-start text-xs border border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          <Icon icon="solar:import-linear" className="mr-1.5" aria-hidden="true" />
          Import from Environment
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#090b0f] p-4 text-xs">
        <span className="font-bold text-slate-300">Capabilities activated:</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedPreset?.capabilities.map(cap => (
            <span key={cap} className="rounded-full bg-[#11151e] border border-slate-800 px-2.5 py-0.5 text-[10px] text-slate-400">
              {cap}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="onboarding-label" label="Display name">
          <input
            id="onboarding-label"
            value={form.label}
            onChange={e => onChange({ ...form, label: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#0e1117] px-3.5 text-sm text-slate-200 focus:border-orange-500/60 focus:outline-none transition"
          />
        </Field>
        <Field id="onboarding-gateway" label="Gateway url">
          <input
            id="onboarding-gateway"
            value={form.gatewayUrl}
            onChange={e => onChange({ ...form, gatewayUrl: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#0e1117] px-3.5 text-sm font-mono text-slate-200 focus:border-orange-500/60 focus:outline-none transition"
          />
        </Field>
        <Field id="onboarding-apikey" label="Api bearer key">
          <input
            id="onboarding-apikey"
            value={form.apiKey}
            onChange={e => onChange({ ...form, apiKey: e.target.value })}
            type="password"
            placeholder="Optional bearer token"
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#0e1117] px-3.5 text-sm text-slate-200 focus:border-orange-500/60 focus:outline-none transition"
          />
        </Field>
        <Field id="onboarding-home" label="Home workspace path">
          <input
            id="onboarding-home"
            value={form.homePath}
            onChange={e => onChange({ ...form, homePath: e.target.value })}
            placeholder="e.g. ~/.hermes"
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#0e1117] px-3.5 text-sm text-slate-200 focus:border-orange-500/60 focus:outline-none transition"
          />
        </Field>
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="onboarding-adapter" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Adapter config parameters (JSON)
          </label>
          <textarea
            id="onboarding-adapter"
            value={form.adapterConfigJson}
            onChange={e => onChange({ ...form, adapterConfigJson: e.target.value })}
            className="min-h-24 w-full rounded-xl border border-slate-800 bg-[#0e1117] p-3 font-mono text-xs text-slate-200 focus:border-orange-500/60 focus:outline-none transition"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white">
          Back to Presets
        </Button>
        <Button onClick={onNext} className="bg-orange-500 hover:bg-orange-600 text-white">
          Next: Test Gateway
        </Button>
      </div>
    </motion.div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
