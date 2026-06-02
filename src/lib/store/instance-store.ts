import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InstanceType } from '@/types';

export interface InstanceState {
  currentInstance: InstanceType;
  animationEnabled: boolean;
  sidebarCollapsed: boolean;
  isSidebarOpen: boolean;
  focusModeActive: boolean;
  ambientSoundEnabled: boolean;
  ambientSoundVolume: number;
  setCurrentInstance: (instance: InstanceType) => void;
  toggleAnimation: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleFocusMode: () => void;
  setFocusMode: (active: boolean) => void;
  toggleAmbientSound: () => void;
  setAmbientSoundVolume: (volume: number) => void;
}

export const useInstanceStore = create<InstanceState>()(
  persist(
    (set) => ({
      currentInstance: 'personal',
      animationEnabled: true,
      sidebarCollapsed: false,
      isSidebarOpen: false,
      focusModeActive: false,
      ambientSoundEnabled: false,
      ambientSoundVolume: 30,

      setCurrentInstance: (instance) => set({ currentInstance: instance }),
      toggleAnimation: () => set((state) => ({ animationEnabled: !state.animationEnabled })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleFocusMode: () => set((state) => ({ focusModeActive: !state.focusModeActive })),
      setFocusMode: (active) => set({ focusModeActive: active }),
      toggleAmbientSound: () => set((state) => ({ ambientSoundEnabled: !state.ambientSoundEnabled })),
      setAmbientSoundVolume: (volume) =>
        set({ ambientSoundVolume: Math.max(0, Math.min(100, volume)) }),
    }),
    {
      name: 'unox-instance',
      partialize: (state) => ({
        animationEnabled: state.animationEnabled,
        sidebarCollapsed: state.sidebarCollapsed,
        focusModeActive: state.focusModeActive,
        ambientSoundEnabled: state.ambientSoundEnabled,
        ambientSoundVolume: state.ambientSoundVolume,
      }),
    }
  )
);
