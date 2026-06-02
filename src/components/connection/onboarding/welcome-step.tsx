'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AGENT_COPY } from './copy';
import type { Discovery, OnboardingForm } from './types';

export function WelcomeStep({
  discovery,
  form,
  onSelect,
}: {
  discovery: Discovery | null;
  form: OnboardingForm;
  onSelect: (agentType: OnboardingForm['agentType']) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6"
    >
      <div className="text-center md:text-left">
        <h3 className="text-lg font-bold text-slate-200">Step 1: Choose Your AI Agent Preset</h3>
        <p className="text-xs text-slate-400 mt-1">Select the agent framework or local model gateway running on your machine.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(discovery?.presets || []).map(preset => {
          const copy = AGENT_COPY[preset.agentType];
          const isSelected = form.agentType === preset.agentType;
          return (
            <button
              key={preset.agentType}
              onClick={() => onSelect(preset.agentType)}
              className={cn(
                'group relative rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-0.5',
                isSelected
                  ? 'border-orange-500/50 bg-[#161310] shadow-lg'
                  : 'border-[#202733]/60 bg-[#0e1117] hover:border-slate-700/60 hover:bg-[#12161f]'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'rounded-xl p-3 bg-gradient-to-br text-white shadow-md',
                  copy?.color || 'from-slate-600 to-slate-800'
                )}>
                  <Icon icon={copy?.icon || 'solar:cpu-bold'} width={22} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">
                    {preset.label}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                      {preset.connectionMode}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
