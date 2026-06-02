import { create } from 'zustand';
import type { Agent, CouncilMessage } from '@/types';

export interface CouncilState {
  agents: Agent[];
  messages: CouncilMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<CouncilMessage, 'id' | 'timestamp'>) => void;
  setAgents: (agents: Agent[]) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useCouncilStore = create<CouncilState>((set) => ({
  agents: [],
  messages: [],
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: newId('council-msg'),
          timestamp: new Date(),
        },
      ],
    })),
  setAgents: (agents) => set({ agents }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}));
