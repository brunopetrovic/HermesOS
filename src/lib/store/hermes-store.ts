import { create } from 'zustand';

// ==========================================
// HERMES SYSTEM STATUS TYPES
// ==========================================

interface GatewayInfo {
  state: string;
  pid: number | null;
  processAlive: boolean;
  httpHealthy: boolean;
  updatedAt: string | null;
  exitReason: string | null;
}

interface PlatformInfo {
  state: string;
  updatedAt?: string;
  error?: string;
}

interface HermesGoal {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'blocked' | 'paused';
  priority: number;
  created: string;
  updated: string;
  tasks: { id: string; title: string; status: string; assignee?: string }[];
  blockers: string[];
  progress: number;
  taskCount: number;
  completedTaskCount: number;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  timezone?: string;
  prompt: string;
  enabled: boolean;
  deliver_to?: string;
  deliver_chat_id?: string;
  skills?: string[];
  model?: string;
  last_run_at?: string;
  last_status?: string;
  last_error?: string;
  next_run_at?: string;
  nextRunEstimate?: string | null;
  scheduleHuman?: string;
  isOverdue?: boolean;
  run_count?: number;
}

interface MemoryL1File {
  name: string;
  path: string;
  size: number;
  maxSize: number;
  content: string;
  lastModified: string;
  usage: number;
}

interface MemoryL3File {
  name: string;
  size: number;
  lastModified: string;
  preview: string;
}

interface HermesSkill {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags: string[];
  source: 'custom' | 'bundled';
  deprecated: boolean;
  hasCron: boolean;
  files: string[];
  contentPreview: string;
}

// ==========================================
// HERMES STORE STATE
// ==========================================

export interface HermesState {
  // System Status
  systemStatus: 'online' | 'degraded' | 'offline' | 'loading' | 'error' | 'not_connected';
  gateway: GatewayInfo | null;
  platforms: Record<string, PlatformInfo>;
  activeModel: string;
  lastStatusCheck: string | null;
  
  // Goals
  goals: HermesGoal[];
  dormantTasks: { id: string; title: string; status: string; assignee?: string }[];
  goalsLoading: boolean;
  goalsStats: {
    total: number;
    active: number;
    completed: number;
    blocked: number;
    avgProgress: number;
    totalTasks: number;
    completedTasks: number;
  };
  
  // Cron Jobs
  cronJobs: CronJob[];
  cronsLoading: boolean;
  cronsStats: {
    total: number;
    enabled: number;
    failed: number;
  };
  
  // Memory
  memoryL1: MemoryL1File[];
  memoryL1Usage: number;
  memoryL2: { exists: boolean; size: number; factCount: number };
  memoryL3: MemoryL3File[];
  memoryLoading: boolean;
  
  // Skills
  skills: HermesSkill[];
  skillsLoading: boolean;
  skillsStats: {
    total: number;
    custom: number;
    bundled: number;
    active: number;
    deprecated: number;
    cronLinked: number;
  };
  allTags: string[];
  
  // Actions
  setStatus: (
    systemStatus: HermesState['systemStatus'],
    gateway: HermesState['gateway'],
    platforms: HermesState['platforms'],
    activeModel: string
  ) => void;
  fetchStatus: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchCrons: () => Promise<void>;
  fetchMemory: () => Promise<void>;
  fetchSkills: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useHermesStore = create<HermesState>((set, get) => ({
  // Initial state
  systemStatus: 'loading',
  gateway: null,
  platforms: {},
  activeModel: 'Unknown',
  lastStatusCheck: null,
  
  goals: [],
  dormantTasks: [],
  goalsLoading: false,
  goalsStats: { total: 0, active: 0, completed: 0, blocked: 0, avgProgress: 0, totalTasks: 0, completedTasks: 0 },
  
  cronJobs: [],
  cronsLoading: false,
  cronsStats: { total: 0, enabled: 0, failed: 0 },
  
  memoryL1: [],
  memoryL1Usage: 0,
  memoryL2: { exists: false, size: 0, factCount: 0 },
  memoryL3: [],
  memoryLoading: false,
  
  skills: [],
  skillsLoading: false,
  skillsStats: { total: 0, custom: 0, bundled: 0, active: 0, deprecated: 0, cronLinked: 0 },
  allTags: [],

  // ==========================================
  // FETCH ACTIONS
  // ==========================================

  setStatus: (systemStatus, gateway, platforms, activeModel) => set({
    systemStatus,
    gateway,
    platforms,
    activeModel,
    lastStatusCheck: new Date().toISOString(),
  }),

  fetchStatus: async () => {
    try {
      const res = await fetch('/api/hermes/status');
      const data = await res.json();
      set({
        systemStatus: data.status,
        gateway: data.gateway,
        platforms: data.platforms,
        activeModel: data.model,
        lastStatusCheck: data.timestamp,
      });
    } catch {
      set({ systemStatus: 'error' });
    }
  },

  fetchGoals: async () => {
    set({ goalsLoading: true });
    try {
      const res = await fetch('/api/hermes/goals');
      const data = await res.json();
      set({
        goals: data.goals || [],
        dormantTasks: data.dormantTasks || [],
        goalsStats: {
          total: data.totalGoals || 0,
          active: data.activeGoals || 0,
          completed: data.completedGoals || 0,
          blocked: data.blockedGoals || 0,
          avgProgress: data.averageProgress || 0,
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0,
        },
        goalsLoading: false,
      });
    } catch {
      set({ goalsLoading: false });
    }
  },

  fetchCrons: async () => {
    set({ cronsLoading: true });
    try {
      const res = await fetch('/api/hermes/crons');
      const data = await res.json();
      set({
        cronJobs: data.jobs || [],
        cronsStats: {
          total: data.totalJobs || 0,
          enabled: data.enabledJobs || 0,
          failed: data.failedJobs || 0,
        },
        cronsLoading: false,
      });
    } catch {
      set({ cronsLoading: false });
    }
  },

  fetchMemory: async () => {
    set({ memoryLoading: true });
    try {
      const res = await fetch('/api/hermes/memory');
      const data = await res.json();
      set({
        memoryL1: data.l1?.files || [],
        memoryL1Usage: data.l1?.totalUsage || 0,
        memoryL2: data.l2 || { exists: false, size: 0, factCount: 0 },
        memoryL3: data.l3?.files || [],
        memoryLoading: false,
      });
    } catch {
      set({ memoryLoading: false });
    }
  },

  fetchSkills: async () => {
    set({ skillsLoading: true });
    try {
      const res = await fetch('/api/hermes/skills');
      const data = await res.json();
      set({
        skills: data.skills || [],
        skillsStats: {
          total: data.totalSkills || 0,
          custom: data.customSkills || 0,
          bundled: data.bundledSkills || 0,
          active: data.activeSkills || 0,
          deprecated: data.deprecatedSkills || 0,
          cronLinked: data.cronLinkedSkills || 0,
        },
        allTags: data.allTags || [],
        skillsLoading: false,
      });
    } catch {
      set({ skillsLoading: false });
    }
  },

  fetchAll: async () => {
    const { fetchStatus, fetchGoals, fetchCrons, fetchMemory, fetchSkills } = get();
    await Promise.all([
      fetchStatus(),
      fetchGoals(),
      fetchCrons(),
      fetchMemory(),
      fetchSkills(),
    ]);
  },
}));
