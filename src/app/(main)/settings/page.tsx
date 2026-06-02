'use client';

import { useInstanceStore } from '@/lib/store/instance-store';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { openAgentOnboarding } from '@/components/connection/agent-onboarding';

export default function SettingsPage() {
  const { animationEnabled, toggleAnimation, sidebarCollapsed, setSidebarCollapsed } = useInstanceStore(
    useShallow(s => ({
      animationEnabled: s.animationEnabled,
      toggleAnimation: s.toggleAnimation,
      sidebarCollapsed: s.sidebarCollapsed,
      setSidebarCollapsed: s.setSidebarCollapsed,
    }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-10">
      <div className="flex items-center gap-3 px-2">
        <Icon icon="solar:settings-linear" className="w-5 h-5 md:w-6 md:h-6 text-accent" />
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Navigation */}
        <div className="md:col-span-1 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl bg-accent/10 text-accent font-medium text-sm">
            <Icon icon="solar:monitor-linear" className="w-4 h-4" />
            <span>Appearance</span>
          </button>
          <button className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl text-text-secondary hover:bg-surface hover:text-text-primary transition-colors font-medium text-sm">
            <Icon icon="solar:bell-linear" className="w-4 h-4" />
            <span>Notifications</span>
          </button>
          <button className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl text-text-secondary hover:bg-surface hover:text-text-primary transition-colors font-medium text-sm">
            <Icon icon="solar:shield-check-linear" className="w-4 h-4" />
            <span>Privacy</span>
          </button>
          <button className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl text-text-secondary hover:bg-surface hover:text-text-primary transition-colors font-medium text-sm">
            <Icon icon="solar:smartphone-linear" className="w-4 h-4" />
            <span>Devices</span>
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <section className="space-y-3 md:space-y-4">
            <h2 className="text-[10px] md:text-xs font-semibold text-text-secondary uppercase tracking-widest px-2">Interface</h2>
            <Card className="p-0 overflow-hidden bg-surface border-border">
              <div className="p-4 md:p-5 flex items-center justify-between border-b border-border/50 gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm md:text-base font-medium text-text-primary">Instance Transitions</p>
                  <p className="text-xs text-text-secondary">Enable smooth 600ms portal animations when switching instances.</p>
                </div>
                <Switch 
                  checked={animationEnabled} 
                  onCheckedChange={toggleAnimation} 
                />
              </div>
              <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm md:text-base font-medium text-text-primary">Theme Mode</p>
                  <p className="text-xs text-text-secondary">Choose your preferred visual style.</p>
                </div>
                <div className="flex bg-bg-secondary p-1 rounded-lg border border-border self-start sm:self-auto">
                  <button className="p-1.5 md:p-2 rounded-md text-text-secondary hover:text-text-primary transition-colors"><Icon icon="solar:sun-linear" className="w-4 h-4" /></button>
                  <button className="p-1.5 md:p-2 rounded-md bg-surface text-accent shadow-sm border border-border"><Icon icon="solar:moon-linear" className="w-4 h-4" /></button>
                  <button className="p-1.5 md:p-2 rounded-md text-text-secondary hover:text-text-primary transition-colors"><Icon icon="solar:monitor-linear" className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4 md:p-5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm md:text-base font-medium text-text-primary">Compact Sidebar</p>
                  <p className="text-xs text-text-secondary">Show only icons in the sidebar by default.</p>
                </div>
                <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} />
              </div>
            </Card>
          </section>

          <section className="space-y-3 md:space-y-4">
            <h2 className="text-[10px] md:text-xs font-semibold text-text-secondary uppercase tracking-widest px-2">Agent connection</h2>
            <Card className="p-5 md:p-6 bg-surface border-border border-dashed">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm md:text-base font-medium text-text-primary mb-1">Local Agent Gateway</p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Connect UNOX to Hermes Agent, OpenClaw, OpenAI-compatible gateways, generic webhooks, local process harnesses, or custom agent gateways. The saved harness uses Paperclip-style adapter config: runtime details live in data, while command execution remains explicit and auditable.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={openAgentOnboarding}
                    className="w-full flex items-center justify-center gap-2 h-11 px-4 text-sm font-bold rounded-[var(--radius-md)] border border-accent text-accent hover:bg-accent/10 transition-all active:scale-[0.98]"
                  >
                    <span>Configure Agent Connection</span>
                    <Icon icon="solar:plug-circle-linear" className="w-4 h-4" />
                  </button>
                  <Link 
                    href="http://localhost:8644" 
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 h-11 px-4 text-sm font-bold rounded-[var(--radius-md)] border border-border text-text-secondary hover:border-accent/60 hover:text-accent transition-all active:scale-[0.98]"
                  >
                    <span>Open Native Dashboard</span>
                    <Icon icon="solar:square-arrow-right-up-linear" className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
