'use client';

import { useInstanceStore } from '@/lib/store/instance-store';
import { useCommandStore } from '@/lib/store/command-store';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { InstanceType } from '@/types';
import { AgentConnectionPill } from '@/components/connection/agent-connection-pill';

interface TopHeaderProps {
  onToggleActivity: () => void;
}

const realmBadge: Record<InstanceType, { label: string; color: string; icon: string }> = {
  personal: { label: 'Personal', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: '🏠' },
  brand: { label: 'Brand', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', icon: '✦' },
  business: { label: 'Business', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: '⚡' },
  nexus: { label: 'Nexus', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: '◈' },
};

function getCurrentRealm(pathname: string | null): InstanceType {
  if (pathname?.startsWith('/nexus')) return 'nexus';
  if (pathname?.startsWith('/brand')) return 'brand';
  if (pathname?.startsWith('/business')) return 'business';
  return 'personal';
}

export function TopHeader({ onToggleActivity }: TopHeaderProps) {
  const { setSidebarOpen, focusModeActive, toggleFocusMode, ambientSoundEnabled, toggleAmbientSound } = useInstanceStore();
  const { open: openCommandBar } = useCommandStore();
  const pathname = usePathname();
  const realm = getCurrentRealm(pathname);
  const badge = realmBadge[realm];

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#333a47]/20 shadow-[0_1px_10px_rgba(0,0,0,0.5)] relative z-10 bg-[#11141a]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3 flex-1 sm:flex-none">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden neu-raised w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 active:translate-y-px shrink-0"
        >
          <Icon icon="solar:hamburger-menu-linear" width={20} />
        </button>

        {/* Command Bar Trigger (replaces basic search) */}
        <button
          onClick={openCommandBar}
          className="flex relative flex-1 max-w-[12rem] sm:max-w-xs lg:max-w-md h-10 rounded-xl neu-inset items-center px-4 cursor-pointer hover:border-[#333a47]/60 transition-colors"
        >
          <Icon icon="solar:magnifer-linear" className="text-slate-500 shrink-0" width={16} />
          <span className="text-sm text-slate-600 ml-2 md:ml-3 font-medium">Search or command...</span>
          <div className="hidden sm:flex ml-auto px-1.5 py-0.5 rounded items-center justify-center bg-[#1a1d24] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/40 text-[10px] text-slate-500 font-mono shrink-0">
            ⌘K
          </div>
        </button>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        <AgentConnectionPill />

        {/* Realm Badge */}
        <div className={cn(
          'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium',
          badge.color
        )}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>

        {/* Focus Mode Toggle */}
        <button
          onClick={toggleFocusMode}
          className={cn(
            'hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all',
            focusModeActive
              ? 'neu-active text-orange-400'
              : 'neu-raised text-slate-400 hover:text-orange-400'
          )}
          title="Toggle Focus Mode (⇧⌘F)"
        >
          <Icon icon={focusModeActive ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={20} />
        </button>

        {/* Ambient Sound Toggle */}
        <button
          onClick={toggleAmbientSound}
          className={cn(
            'hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all',
            ambientSoundEnabled
              ? 'neu-active text-orange-400'
              : 'neu-raised text-slate-400 hover:text-orange-400'
          )}
          title="Toggle Ambient Audio"
        >
          <Icon icon={ambientSoundEnabled ? 'solar:music-note-2-linear' : 'solar:music-note-linear'} width={20} />
        </button>

        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl neu-raised text-slate-300 hover:text-white transition-all">
          <span className="w-2 h-2 rounded-full dot-orange shrink-0" />
          <span className="text-sm font-medium">Ping Una</span>
        </button>

        <button className="hidden md:flex w-10 h-10 rounded-xl neu-raised items-center justify-center text-slate-400 hover:text-orange-400 transition-all">
          <Icon icon="solar:refresh-linear" width={20} />
        </button>

        {/* Mobile-only Activity Toggle */}
        <button
          onClick={onToggleActivity}
          className="xl:hidden w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-orange-500 active:translate-y-px transition-all relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
          <Icon icon="solar:history-linear" width={20} className="relative z-10" />
        </button>
      </div>
    </header>
  );
}

// Re-export for backwards compatibility
export { TopHeader as Header };
