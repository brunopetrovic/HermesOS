import type { AgentType, HarnessCapability, HarnessConfigField, HarnessConnectionMode, HarnessPreset } from '@/lib/agent-harnesses';

export type MaskedConnection = {
  agentType: AgentType;
  adapterType: string;
  connectionMode: HarnessConnectionMode;
  label: string;
  gatewayUrl: string;
  homePath?: string;
  connectedAt?: string;
  capabilities?: HarnessCapability[];
  adapterConfig?: Record<string, unknown>;
  hasApiKey?: boolean;
  apiKeyPreview?: string | null;
};

export type PresetClientShape = Omit<HarnessPreset, 'paperclipPattern' | 'configFields' | 'safetyNotes' | 'capabilities' | 'canChat' | 'canExecuteTask' | 'canStreamLogs' | 'canSyncMemory'> & {
  paperclipPattern: string;
  configFields: HarnessConfigField[];
  safetyNotes: string[];
  capabilities: HarnessCapability[];
};

export type Discovery = {
  defaultGatewayUrl: string;
  detectedHomes: { agentType: AgentType; path: string; exists: boolean; source: string }[];
  presets: PresetClientShape[];
};

export type ConnectionResponse = {
  connected: boolean;
  connection: MaskedConnection | null;
  discovery?: Discovery;
};

export type TestResult = {
  ok: boolean;
  status: number | null;
  detail: string;
  checkedEndpoint?: string;
};

export type OnboardingForm = {
  agentType: AgentType;
  label: string;
  gatewayUrl: string;
  apiKey: string;
  homePath: string;
  adapterConfigJson: string;
};

export const EMPTY_FORM: OnboardingForm = {
  agentType: 'hermes',
  label: 'Hermes Agent',
  gatewayUrl: 'http://localhost:8642',
  apiKey: '',
  homePath: '',
  adapterConfigJson: '{}',
};
