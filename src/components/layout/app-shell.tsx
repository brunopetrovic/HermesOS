'use client';

import { useInstanceStore } from '@/lib/store/instance-store';
import { Sidebar } from '@/components/navigation/sidebar';
import { TopHeader } from '@/components/navigation/header';
import { ActivitySidebar } from '@/components/navigation/activity-sidebar';
import { UnaOrb } from '@/components/una/una-orb';
import { CommandBarTrigger } from '@/components/command-bar/command-bar-trigger';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useShallow } from 'zustand/react/shallow';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getRealmFromPathname } from '@/lib/realm';

const CommandBar = dynamic(
  () => import('@/components/command-bar/command-bar').then(m => m.CommandBar),
  { ssr: false }
);

const AgentOnboarding = dynamic(
  () => import('@/components/connection/agent-onboarding').then(m => m.AgentOnboarding),
  { ssr: false }
);

const SoundscapeController = dynamic(
  () => import('@/components/ambient/soundscape-controller').then(m => m.SoundscapeController),
  { ssr: false }
);

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isSidebarOpen, setSidebarOpen, focusModeActive, setCurrentInstance, toggleFocusMode } = useInstanceStore(
    useShallow(s => ({
      isSidebarOpen: s.isSidebarOpen,
      setSidebarOpen: s.setSidebarOpen,
      focusModeActive: s.focusModeActive,
      setCurrentInstance: s.setCurrentInstance,
      toggleFocusMode: s.toggleFocusMode,
    }))
  );
  const [isActivityOpen, setActivityOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const realm = getRealmFromPathname(pathname);
    if (useInstanceStore.getState().currentInstance !== realm) {
      setCurrentInstance(realm);
    }
  }, [pathname, setCurrentInstance]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setActivityOpen(false);
        setSidebarOpen(false);
      } else if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode]);

  const isOverlayVisible = isSidebarOpen || isActivityOpen;
  const currentRealm = getRealmFromPathname(pathname);

  return (
    <div
      className={cn('flex w-full h-full relative', focusModeActive && 'focus-mode')}
      data-realm={currentRealm}
    >
      {isOverlayVisible && (
        <div
          onClick={() => {
            setSidebarOpen(false);
            setActivityOpen(false);
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 xl:hidden cursor-pointer animate-fade-in"
          aria-hidden="true"
        />
      )}

      <Sidebar />

      <main className="flex-1 flex flex-col h-full relative bg-gradient-to-br from-bg-secondary via-bg-primary to-black min-w-0">
        <div className="focus-dimmable">
          <TopHeader onToggleActivity={() => setActivityOpen(!isActivityOpen)} />
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-28 md:pb-8 flex flex-col gap-6 md:gap-8 relative z-10 custom-scrollbar">
          {children}
        </div>
      </main>

      <ActivitySidebar isOpen={isActivityOpen} onClose={() => setActivityOpen(false)} />

      <BottomNav />

      <UnaOrb />
      <CommandBarTrigger />
      <CommandBar />
      <SoundscapeController />
      <AgentOnboarding />
    </div>
  );
}
