import { create } from 'zustand';

export interface UnaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  approvalNeeded?: ApprovalRequest;
}

export interface ApprovalRequest {
  id: string;
  action: string;
  details: string;
  tool_used?: string[];
  createdAt: Date;
}

export interface ApprovalQueueItem extends ApprovalRequest {
  status: 'pending' | 'approved' | 'denied';
}

export interface UnaState {
  messages: UnaMessage[];
  isLoading: boolean;
  approvalQueue: ApprovalQueueItem[];
  isPanelOpen: boolean;
  isThinking: boolean;
  addMessage: (message: Omit<UnaMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setThinking: (thinking: boolean) => void;
  addApproval: (approval: ApprovalRequest) => void;
  updateApprovalStatus: (id: string, status: 'approved' | 'denied') => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  clearMessages: () => void;
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useUnaStore = create<UnaState>((set) => ({
  messages: [],
  isLoading: false,
  approvalQueue: [],
  isPanelOpen: false,
  isThinking: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: newId('msg'),
          timestamp: new Date(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setThinking: (thinking) => set({ isThinking: thinking }),

  addApproval: (approval) =>
    set((state) => ({
      approvalQueue: [
        ...state.approvalQueue,
        { ...approval, status: 'pending' },
      ],
    })),

  updateApprovalStatus: (id, status) =>
    set((state) => ({
      approvalQueue: state.approvalQueue.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  clearMessages: () => set({ messages: [] }),
}));
