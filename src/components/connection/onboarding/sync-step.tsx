'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { OnboardingForm } from './types';

export function SyncStep({
  form,
  connected,
  saving,
  error,
  onSave,
  onDisconnect,
  onAdjust,
}: {
  form: OnboardingForm;
  connected: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onDisconnect: () => void;
  onAdjust: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6"
    >
      <div className="text-center max-w-md mx-auto space-y-2">
        <div className="inline-flex rounded-full bg-emerald-500/10 border border-emerald-500/25 p-3 text-emerald-400">
          <Icon icon="solar:shield-check-bold" width={32} aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Step 4: Connection Synchronized!</h3>
        <p className="text-xs text-slate-400">Your configuration was validated and is ready for use locally.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0e1117] p-5 max-w-xl mx-auto space-y-3">
        <SummaryRow label="Agent Type" value={form.agentType.toUpperCase()} mono />
        <SummaryRow label="Display Label" value={form.label} />
        <SummaryRow label="Gateway Endpoint" value={form.gatewayUrl} mono truncate />
        <SummaryRow label="Storage Path" value={form.homePath || 'None (Gateway Only)'} mono truncate />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 max-w-xl mx-auto">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-xl mx-auto pt-4">
        <Button
          onClick={onSave}
          loading={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-sm"
        >
          {connected ? 'Re-sync & Launch Cockpit' : 'Activate Connection & Launch'}
        </Button>

        {connected && (
          <button
            onClick={onDisconnect}
            disabled={saving}
            className="w-full text-xs font-bold text-red-400 hover:text-red-300 transition py-2"
          >
            Disconnect Saved Agent Configuration
          </button>
        )}

        <button
          onClick={onAdjust}
          className="text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Adjust connection details
        </button>
      </div>
    </motion.div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-3 last:border-b-0 last:pb-0">
      <span className="text-slate-500 font-bold uppercase tracking-wider">{label}</span>
      <span className={cn(
        mono ? 'font-mono' : '',
        truncate ? 'truncate max-w-xs' : '',
        'text-slate-200'
      )}>
        {value}
      </span>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
