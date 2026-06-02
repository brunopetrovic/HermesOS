'use client';

import { useInstanceStore } from '@/lib/store/instance-store';
import { useCommandStore } from '@/lib/store/command-store';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { getRealmFromPathname, REALM_THEME } from '@/lib/realm';
import { AgentConnectionPill } from '@/components/connection/agent-connection-pill';

interface TopHeaderProps {
  onToggleActivity: () => void;
}

export function TopHeader({ onToggleActivity }: TopHeaderProps) {
  const { setSidebarOpen, focusModeActive, toggleFocusMode, ambientSoundEnabled, toggleAmbientSound } = useInstanceStore(
    useShallow(s => ({
      setSidebarOpen: s.setSidebarOpen,
      focusModeActive: s.focusModeActive,
      toggleFocusMode: s.toggleFocusMode,
      ambientSoundEnabled: s.ambientSoundEnabled,
      toggleAmbientSound: s.toggleAmbientSound,
    }))
  );
  const openCommandBar = useCommandStore(s => s.open);
  const pathname = usePathname();
  const realm = getRealmFromPathname(pathname);
  const badge = REALM_THEME[realm];

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#333a47]/20 shadow-[0_1px_10px_rgba(0,0,0,0.5)] relative z-10 bg-[#11141a]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3 flex-1 sm:flex-none">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden neu-raised w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 active:translate-y-px shrink-0"
          aria-label="Open navigation menu"
        >
          <Icon icon="solar:hamburger-menu-linear" width={20} />
        </button>

        <button
          onClick={openCommandBar}
          className="flex relative items-center justify-center sm:justify-start w-10 sm:w-auto sm:flex-1 sm:max-w-xs lg:max-w-md h-10 rounded-xl neu-inset px-0 sm:px-4 cursor-pointer hover:border-[#333a47]/60 transition-colors"
          aria-label="Open command bar (⌘K)"
        >
          <Icon icon="solar:magnifer-linear" className="text-slate-500 shrink-0" width={16} />
          <span className="hidden sm:inline-block text-sm text-slate-600 ml-3 font-medium">
            Search or command...
          </span>
          <div className="hidden sm:flex ml-auto px-1.5 py-0.5 rounded items-center justify-center bg-[#1a1d24] shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-[#333a47]/40 text-[10px] text-slate-500 font-mono shrink-0">
            ⌘K
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        <AgentConnectionPill />

        <div
          className={cn(
            'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium',
            badge.accent
          )}
          aria-label={`Current realm: ${badge.label}`}
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>

        <button
          onClick={toggleFocusMode}
          className={cn(
            'hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all',
            focusModeActive
              ? 'neu-active text-orange-400'
              : 'neu-raised text-slate-400 hover:text-orange-400'
          )}
          title="Toggle Focus Mode (⇧⌘F)"
          aria-label="Toggle Focus Mode"
          aria-pressed={focusModeActive}
        >
          <Icon icon={focusModeActive ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={20} />
        </button>

        <button
          onClick={toggleAmbientSound}
          className={cn(
            'hidden sm:flex w-10 h-10 rounded-xl items-center justify-center transition-all',
            ambientSoundEnabled
              ? 'neu-active text-orange-400'
              : 'neu-raised text-slate-400 hover:text-orange-400'
          )}
          title="Toggle Ambient Audio"
          aria-label="Toggle Ambient Audio"
          aria-pressed={ambientSoundEnabled}
        >
          <Icon icon={ambientSoundEnabled ? 'solar:music-note-2-linear' : 'solar:music-note-linear'} width={20} />
        </button>

        <button
          onClick={() => window.dispatchEvent(new Event('open-agent-onboarding'))}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl neu-raised text-slate-300 hover:text-white transition-all"
          aria-label="Open agent connection wizard"
        >
          <span className="w-2 h-2 rounded-full dot-orange shrink-0" />
          <span className="text-sm font-medium">Connect Agent</span>
        </button>

        <button
          className="hidden md:flex w-10 h-10 rounded-xl neu-raised items-center justify-center text-slate-400 hover:text-orange-400 transition-all"
          aria-label="Refresh"
        >
          <Icon icon="solar:refresh-linear" width={20} />
        </button>

        <button
          onClick={onToggleActivity}
          className="xl:hidden w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-orange-500 active:translate-y-px transition-all relative overflow-hidden"
          aria-label="Toggle activity sidebar"
        >
          <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" aria-hidden="true" />
          <Icon icon="solar:history-linear" width={20} className="relative z-10" />
        </button>
      </div>
    </header>
  );
}
