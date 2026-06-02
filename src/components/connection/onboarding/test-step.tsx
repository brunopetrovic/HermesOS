'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OnboardingForm, TestResult } from './types';

export function TestStep({
  form,
  testing,
  testResult,
  error,
  onBack,
  onTest,
  onNext,
}: {
  form: OnboardingForm;
  testing: boolean;
  testResult: TestResult | null;
  error: string | null;
  onBack: () => void;
  onTest: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-6 text-center"
    >
      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-bold text-slate-200">Step 3: Probe Gateway Connection</h3>
        <p className="text-xs text-slate-400">
          Verifying gateway status on URL: <span className="font-mono text-slate-300">{form.gatewayUrl}</span>
        </p>

        <div className="relative flex justify-center py-6">
          <div className={cn(
            'relative h-20 w-20 rounded-full flex items-center justify-center border transition-all duration-500',
            testing ? 'border-orange-500 bg-orange-500/5' : testResult?.ok ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'
          )}>
            {testing && (
              <span className="absolute inset-0 rounded-full border border-orange-500 animate-ping opacity-70" />
            )}
            {testResult?.ok && (
              <span className="absolute inset-0 rounded-full border border-emerald-500 animate-pulse opacity-40" />
            )}
            <Icon
              icon={testing ? 'solar:radar-bold-duotone' : testResult?.ok ? 'solar:check-circle-bold-duotone' : 'solar:plug-broken-bold-duotone'}
              className={cn(
                'w-10 h-10',
                testing ? 'text-orange-500 animate-spin' : testResult?.ok ? 'text-emerald-400' : 'text-slate-500'
              )}
              aria-hidden="true"
            />
          </div>
        </div>

        {testResult && (
          <div className={cn(
            'rounded-xl border p-4 text-xs font-medium max-w-sm mx-auto',
            testResult.ok ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'
          )}>
            <p className="font-bold">{testResult.ok ? 'Probe Succeeded!' : 'Connection Refused'}</p>
            <p className="mt-1 opacity-80">{testResult.detail}</p>
            {testResult.checkedEndpoint && (
              <p className="mt-1.5 font-mono text-[10px] opacity-60">Endpoint: {testResult.checkedEndpoint}</p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 max-w-sm mx-auto">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white" disabled={testing}>
            Back
          </Button>
          <Button onClick={onTest} loading={testing} className="bg-orange-500 hover:bg-orange-600 text-white min-w-32">
            {testResult ? 'Probe Again' : 'Start Probe'}
          </Button>
          {testResult?.ok && (
            <Button onClick={onNext} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Sync Cockpit
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
