export type InstanceType = 'personal' | 'brand' | 'business' | 'nexus';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

// ==========================================
// REALM THEME
// ==========================================
export interface RealmTheme {
  bgPrimary: string;
  bgSecondary: string;
  surface: string;
  accent: string;
  accentGlow: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
}

// ==========================================
// TASK
// ==========================================
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  instance: InstanceType;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  assignee?: string;
  subtasks?: SubTask[];
  goalId?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// ==========================================
// GOAL
// ==========================================
export type GoalLifecycleStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  instance: InstanceType;
  progress: number; // 0-100
  status?: GoalLifecycleStatus;
  deadline?: Date;
  milestones?: Milestone[];
  linkedTasks?: string[]; // Task IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  done?: boolean;
  dueDate?: Date;
  order?: number;
}

// ==========================================
// CALENDAR EVENT
// ==========================================
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  instance: InstanceType;
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  location?: string;
  reminder?: number; // minutes before
  recurring?: RecurringConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
}

// ==========================================
// HABIT
// ==========================================
export interface Habit {
  id: string;
  title: string;
  description?: string;
  instance: InstanceType;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completions: HabitCompletion[];
  createdAt: Date;
}

export interface HabitCompletion {
  date: Date;
  completed: boolean;
}

// ==========================================
// CONTACT (CRM)
// ==========================================
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  tags?: string[];
  instance: InstanceType;
  lastInteraction?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// DEAL (CRM Pipeline)
// ==========================================
export interface Deal {
  id: string;
  title: string;
  contactId: string;
  stage: DealStage;
  value?: number;
  currency?: string;
  instance: InstanceType;
  expectedCloseDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// CONTENT (Brand)
// ==========================================
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  platform: 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'blog' | 'podcast';
  status: 'ideation' | 'creating' | 'scheduling' | 'published';
  instance: InstanceType;
  publishDate?: Date;
  content?: string;
  mediaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// COUNCIL / AGENT
// ==========================================
export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  description?: string;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface CouncilMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string; // If from a specific agent
  timestamp: Date;
}

// ==========================================
// PERSONA
// ==========================================
export type PersonaTone = 'natural' | 'professional' | 'empathetic' | 'direct';
export type PersonaCategory = 'famous' | 'business' | 'health' | 'personal' | 'historic' | 'custom';

export interface Persona {
  id: string;
  name: string;
  description: string;
  category: PersonaCategory;
  image?: string;
  systemPrompt: string; // SOUL.md content
  tone: PersonaTone;
  voiceId?: string;
  skills: string[];
  idDocuments: string[]; // .md file paths
  audioConfig?: {
    stt: boolean;
    tts: boolean;
    voiceId?: string;
    musicEnabled?: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// VOICE
// ==========================================
export interface Voice {
  id: string;
  name: string;
  description: string;
  provider: string; // e.g., 'elevenlabs', 'openai', 'local'
  previewUrl?: string;
  isDefault: boolean;
  createdAt: Date;
}

// ==========================================
// SCHOOL (Knowledge Intake)
// ==========================================
export type SchoolItemType = 'document' | 'link' | 'youtube' | 'note' | 'file';
export type SchoolItemStatus = 'queued' | 'processing' | 'analyzed' | 'categorized' | 'integrated' | 'failed';

export interface SchoolItem {
  id: string;
  type: SchoolItemType;
  title: string;
  source: string; // URL, file path, or raw content
  status: SchoolItemStatus;
  category?: string; // Auto-detected niche/category
  extractedData?: string;
  knowledgeBaseId?: string; // Where it was stored
  createdAt: Date;
  processedAt?: Date;
}

// ==========================================
// GYM / DOJO (Skill Acquisition)
// ==========================================
export type SkillPipelineStage = 'discover' | 'evaluate' | 'test' | 'integrate' | 'install' | 'installed' | 'failed';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  source: string; // URL or reference
  stage: SkillPipelineStage;
  evaluation?: {
    score: number;
    notes: string;
  };
  testResults?: {
    passed: boolean;
    details: string;
  };
  installedAt?: Date;
  createdAt: Date;
}

// ==========================================
// BUNKER (Security & Control)
// ==========================================
export interface BunkerKey {
  id: string;
  name: string;
  service: string;
  keyPreview: string; // masked, e.g., "sk-...abc123"
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export interface SecurityMeasure {
  id: string;
  name: string;
  type: 'firewall' | 'encryption' | 'auth' | 'monitoring' | 'isolation';
  status: 'active' | 'inactive' | 'warning';
  description: string;
}

export interface DiagnosticEntry {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  timestamp: Date;
}

// ==========================================
// INTELLIGENCE (Automation & Agency)
// ==========================================
export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
  createdAt: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'trigger' | 'delay';
  config: Record<string, unknown>;
  nextStepId?: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  events: string[];
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface AgentCommand {
  id: string;
  name: string;
  description: string;
  category: 'audit' | 'sprint' | 'research' | 'system' | 'custom';
  command: string;
  parameters?: Record<string, string>;
  lastRun?: Date;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  version: string;
  documentation?: string;
  isInstalled: boolean;
}

// ==========================================
// KNOWLEDGE GRAPH
// ==========================================
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'concept' | 'skill' | 'person' | 'project' | 'memory' | 'document' | 'goal';
  realm?: InstanceType;
  data?: Record<string, unknown>;
  position?: { x: number; y: number };
  energy: number; // 0-100, determines visual intensity
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  strength: number; // 0-100, determines thickness/brightness/pulsing
  type: 'related' | 'depends_on' | 'created_by' | 'part_of' | 'evolved_from';
}

// ==========================================
// COMMAND BAR
// ==========================================
export type CommandCategory = 'navigation' | 'realm' | 'action' | 'una' | 'system';

export interface CommandBarAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  category: CommandCategory;
  shortcut?: string;
  realm?: InstanceType; // If realm-specific
  action: () => void;
}

// ==========================================
// FOCUS MODE
// ==========================================
export interface FocusModeState {
  active: boolean;
  realm: InstanceType;
  startedAt?: Date;
  duration?: number; // minutes
}

// ==========================================
// BRAIN DOCUMENT
// ==========================================
export interface BrainDocument {
  id: string;
  filename: string; // e.g., SOUL.md, IDENTITY.md
  title: string;
  content: string;
  category: 'identity' | 'memory' | 'agent' | 'config';
  lastModified: Date;
}

// ==========================================
// INSTANCE CONFIG
// ==========================================
export interface InstanceConfig {
  type: InstanceType;
  label: string;
  icon: string;
  tagline: string;
  kanbanColumns: KanbanColumn[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
}

export const INSTANCE_CONFIGS: Record<InstanceType, InstanceConfig> = {
  personal: {
    type: 'personal',
    label: 'Personal Life',
    icon: '🏠',
    tagline: 'Your home base',
    kanbanColumns: [
      { id: 'todo', title: 'To Do', status: 'todo' },
      { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
      { id: 'review', title: 'Review', status: 'review' },
      { id: 'done', title: 'Done', status: 'done' },
    ],
  },
  brand: {
    type: 'brand',
    label: 'Personal Brand',
    icon: '✦',
    tagline: 'Your magnetic presence',
    kanbanColumns: [
      { id: 'ideation', title: 'Ideation', status: 'todo' },
      { id: 'creating', title: 'Creating', status: 'in_progress' },
      { id: 'scheduling', title: 'Scheduling', status: 'review' },
      { id: 'published', title: 'Published', status: 'done' },
    ],
  },
  business: {
    type: 'business',
    label: 'Business',
    icon: '⚡',
    tagline: 'Command center',
    kanbanColumns: [
      { id: 'backlog', title: 'Backlog', status: 'todo' },
      { id: 'sprint', title: 'Sprint', status: 'in_progress' },
      { id: 'in_dev', title: 'In Dev', status: 'review' },
      { id: 'done', title: 'Done', status: 'done' },
      { id: 'blocked', title: 'Blocked', status: 'blocked' },
    ],
  },
  nexus: {
    type: 'nexus',
    label: 'The Nexus',
    icon: '◈',
    tagline: 'Where we become one',
    kanbanColumns: [
      { id: 'forming', title: 'Forming', status: 'todo' },
      { id: 'evolving', title: 'Evolving', status: 'in_progress' },
      { id: 'manifesting', title: 'Manifesting', status: 'review' },
      { id: 'transcended', title: 'Transcended', status: 'done' },
    ],
  },
};

// ==========================================
// NAVIGATION
// ==========================================
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  instance?: InstanceType;
  badge?: number;
}

export const NAV_ITEMS: Record<InstanceType, NavItem[]> = {
  personal: [
    { id: 'home', label: 'Home', icon: 'home', href: '/personal' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square', href: '/personal/tasks' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '/personal/calendar' },
    { id: 'goals', label: 'Goals', icon: 'target', href: '/personal/goals' },
    { id: 'habits', label: 'Habits', icon: 'repeat', href: '/personal/habits' },
    { id: 'system', label: 'System', icon: 'server', href: '/system' },
  ],
  brand: [
    { id: 'home', label: 'Home', icon: 'home', href: '/brand' },
    { id: 'content', label: 'Content', icon: 'edit', href: '/brand/content' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '/brand/calendar' },
    { id: 'social', label: 'Social', icon: 'share-2', href: '/brand/social' },
    { id: 'portfolio', label: 'Portfolio', icon: 'image', href: '/brand/portfolio' },
    { id: 'system', label: 'System', icon: 'server', href: '/system' },
  ],
  business: [
    { id: 'home', label: 'Home', icon: 'home', href: '/business' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square', href: '/business/tasks' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '/business/calendar' },
    { id: 'crm', label: 'CRM', icon: 'users', href: '/business/crm' },
    { id: 'projects', label: 'Projects', icon: 'folder', href: '/business/projects' },
    { id: 'system', label: 'System', icon: 'server', href: '/system' },
  ],
  nexus: [
    { id: 'home', label: 'The Nexus', icon: 'home', href: '/nexus' },
    { id: 'graph', label: 'Knowledge Graph', icon: 'git-branch', href: '/nexus/graph' },
    { id: 'workbench', label: 'Workbench', icon: 'tool', href: '/nexus/workbench' },
  ],
};

// ==========================================
// SIDEBAR NAV SECTIONS
// ==========================================
export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const SIDEBAR_SECTIONS: NavSection[] = [
  {
    id: 'mission-control',
    label: 'Mission Control',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'solar:home-2-linear', href: '/dashboard' },
      { id: 'una', label: 'Una', icon: 'solar:chat-round-linear', href: '/una' },
      { id: 'nexus', label: 'The Nexus', icon: 'solar:atom-linear', href: '/nexus' },
      { id: 'goals', label: 'Goals', icon: 'solar:target-linear', href: '/goals' },
      { id: 'revenue', label: 'Revenue', icon: 'solar:wallet-money-linear', href: '/revenue' },
      { id: 'customers', label: 'Customers', icon: 'solar:users-group-rounded-linear', href: '/customers' },
    ],
  },
  {
    id: 'brain',
    label: 'Brain',
    items: [
      { id: 'brain', label: 'Overview', icon: 'mingcute:brain-line', href: '/brain' },
      { id: 'personas', label: 'Personas', icon: 'solar:masks-linear', href: '/brain/personas' },
      { id: 'knowledge', label: 'Knowledge', icon: 'solar:book-bookmark-linear', href: '/brain/knowledge' },
      { id: 'memories', label: 'Memories', icon: 'solar:database-linear', href: '/brain/memories' },
      { id: 'skills', label: 'Skills', icon: 'solar:widget-linear', href: '/brain/skills' },
    ],
  },
  {
    id: 'apps',
    label: 'Apps',
    items: [
      { id: 'school', label: 'School', icon: 'solar:square-academic-cap-2-linear', href: '/school' },
      { id: 'gym', label: 'Gym', icon: 'solar:dumbbell-large-minimalistic-linear', href: '/gym' },
      { id: 'wiki', label: 'Wiki', icon: 'solar:notebook-bookmark-linear', href: '/wiki' },
      { id: 'tasks', label: 'Tasks', icon: 'solar:clipboard-list-linear', href: '/tasks' },
      { id: 'sessions', label: 'Sessions', icon: 'solar:clock-circle-linear', href: '/sessions' },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { id: 'intelligence', label: 'Overview', icon: 'solar:cpu-bolt-linear', href: '/intelligence' },
      { id: 'workflows', label: 'Workflows', icon: 'solar:route-linear', href: '/intelligence/workflows' },
      { id: 'crons', label: 'Crons', icon: 'solar:clock-circle-linear', href: '/intelligence/crons' },
      { id: 'commands', label: 'Commands', icon: 'solar:command-linear', href: '/intelligence/commands' },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    items: [
      { id: 'bunker', label: 'Bunker', icon: 'solar:shield-star-linear', href: '/bunker' },
      { id: 'system', label: 'System', icon: 'solar:server-square-linear', href: '/system' },
      { id: 'settings', label: 'Settings', icon: 'solar:settings-linear', href: '/settings' },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', href: '/dashboard' },
  { id: 'nexus', label: 'Nexus', icon: 'atom', href: '/nexus' },
  { id: 'brain', label: 'Brain', icon: 'brain', href: '/brain' },
  { id: 'una', label: 'Una', icon: 'sparkles', href: '/una' },
  { id: 'settings', label: 'More', icon: 'menu', href: '/settings' },
];
