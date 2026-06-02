'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InstanceType } from '@/types';

export type OrbVariant = 'organic' | 'golden' | 'holographic' | 'cosmic';

export interface OrbStoreState {
  x: number;
  y: number;
  isPinned: boolean;
  pinnedEdge: 'left' | 'right' | 'bottom' | null;
  isDragging: boolean;
  isExpanded: boolean;
  hasNotification: boolean;
  notificationCount: number;
  variant: OrbVariant;
  setPosition: (x: number, y: number) => void;
  setDragging: (dragging: boolean) => void;
  setPinned: (pinned: boolean, edge?: 'left' | 'right' | 'bottom') => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setNotification: (has: boolean, count?: number) => void;
  updateVariantForRealm: (realm: InstanceType) => void;
}

function getVariantForRealm(realm: InstanceType): OrbVariant {
  switch (realm) {
    case 'personal':
      return 'organic';
    case 'brand':
      return 'golden';
    case 'business':
      return 'holographic';
    case 'nexus':
      return 'cosmic';
    default:
      return 'organic';
  }
}

export const useOrbStore = create<OrbStoreState>()(
  persist(
    (set) => ({
      x: 0,
      y: 0,
      isPinned: true,
      pinnedEdge: 'right',
      isDragging: false,
      isExpanded: false,
      hasNotification: false,
      notificationCount: 0,
      variant: 'organic',

      setPosition: (x, y) => set({ x, y }),
      setDragging: (dragging) => set({ isDragging: dragging }),
      setPinned: (pinned, edge) => set({ isPinned: pinned, pinnedEdge: edge ?? null }),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setNotification: (has, count) => set({ hasNotification: has, notificationCount: count ?? 0 }),
      updateVariantForRealm: (realm) => set({ variant: getVariantForRealm(realm) }),
    }),
    {
      name: 'unox-orb',
      partialize: (state) => ({
        x: state.x,
        y: state.y,
        isPinned: state.isPinned,
        pinnedEdge: state.pinnedEdge,
      }),
      skipHydration: true,
    }
  )
);
