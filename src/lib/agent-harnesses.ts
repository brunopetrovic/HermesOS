export type AgentType = 'hermes' | 'openclaw' | 'openai' | 'http' | 'process' | 'custom';

export type HarnessConnectionMode = 'local-cli' | 'gateway' | 'webhook' | 'command';

export type HarnessCapability =
  | 'gateway-probe'
  | 'local-home-sync'
  | 'model-discovery'
  | 'command-invocation'
  | 'webhook-invocation'
  | 'runtime-logs'
  | 'bearer-auth'
  | 'skill-sync';

export type HarnessFieldType = 'text' | 'url' | 'secret' | 'path' | 'textarea' | 'number';

export interface HarnessConfigField {
  key: string;
  label: string;
  type: HarnessFieldType;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  envVars?: string[];
}

export interface HarnessPreset {
  agentType: AgentType;
  adapterType: string;
  label: string;
  shortLabel: string;
  icon: string;
  connectionMode: HarnessConnectionMode;
  gatewayUrl: string;
  description: string;
  paperclipPattern: string;
  capabilities: HarnessCapability[];
  healthEndpoints: string[];
  configFields: HarnessConfigField[];
  safetyNotes: string[];
}

const commonGatewayFields: HarnessConfigField[] = [
  {
    key: 'gatewayUrl',
    label: 'Gateway URL',
    type: 'url',
    required: true,
    placeholder: 'http://localhost:8642',
    helper: 'Base URL for the local or private-network agent gateway.',
  },
  {
    key: 'apiKey',
    label: 'Bearer token / API key',
    type: 'secret',
    placeholder: 'Optional',
    helper: 'Stored locally and only sent as an Authorization bearer token.',
  },
];

export const HARNESS_PRESETS: HarnessPreset[] = [
  {
    agentType: 'hermes',
    adapterType: 'hermes_local',
    label: 'Hermes Agent',
    shortLabel: 'Hermes',
    icon: 'solar:bolt-circle-linear',
    connectionMode: 'local-cli',
    gatewayUrl: process.env.HERMES_GATEWAY_URL || 'http://localhost:8642',
    description:
      'Hermes Agent local gateway plus optional home-path sync for memory, sessions, skills, crons, goals, and status panels.',
    paperclipPattern:
      'Paperclip treats Hermes as a local adapter: adapter config defines command/home/profile while the control plane injects safe runtime context and reads observable run state.',
    capabilities: [
      'gateway-probe',
      'local-home-sync',
      'model-discovery',
      'command-invocation',
      'runtime-logs',
      'bearer-auth',
      'skill-sync',
    ],
    healthEndpoints: ['/health', '/api/health', '/api/status', '/v1/models', '/'],
    configFields: [
      ...commonGatewayFields,
      {
        key: 'homePath',
        label: 'Hermes home path',
        type: 'path',
        placeholder: '~/.hermes',
        helper: 'Unlocks local file-backed memory, sessions, skills, crons, and goals.',
        envVars: ['HERMES_HOME'],
      },
      {
        key: 'command',
        label: 'CLI command',
        type: 'text',
        placeholder: 'hermes',
        helper: 'Future heartbeat/command execution hook. UNOX does not auto-run it without an explicit action.',
      },
      {
        key: 'profile',
        label: 'Hermes profile',
        type: 'text',
        placeholder: 'default',
        helper: 'Optional profile name for future profile-scoped runs.',
      },
    ],
    safetyNotes: [
      'Prefer localhost or Tailscale/private-network exposure.',
      'Never expose a write-capable Hermes gateway publicly without auth.',
      'UNOX separates gateway reachability from future command execution.',
    ],
  },
  {
    agentType: 'openclaw',
    adapterType: 'openclaw_gateway',
    label: 'OpenClaw Gateway',
    shortLabel: 'OpenClaw',
    icon: 'solar:widget-5-linear',
    connectionMode: 'gateway',
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || process.env.CLAWDBOT_URL || 'http://localhost:3333',
    description:
      'OpenClaw / Claw-compatible HTTP gateway for agents that wake up through a remote control surface.',
    paperclipPattern:
      'Paperclip models OpenClaw as a gateway adapter: the control plane posts context to a gateway and observes the response instead of owning the runtime.',
    capabilities: ['gateway-probe', 'webhook-invocation', 'runtime-logs', 'bearer-auth'],
    healthEndpoints: ['/api/health', '/health', '/api/status', '/'],
    configFields: [
      ...commonGatewayFields,
      {
        key: 'homePath',
        label: 'Workspace / home path',
        type: 'path',
        placeholder: '~/.openclaw-workspace',
        helper: 'Optional local workspace path if UNOX runs on the same machine.',
        envVars: ['OPENCLAW_WORKSPACE'],
      },
    ],
    safetyNotes: [
      'Treat gateway calls as external agent wakeups, not local process ownership.',
      'Keep gateway credentials private and rotate them if exposed.',
    ],
  },
  {
    agentType: 'openai',
    adapterType: 'openai_compatible_gateway',
    label: 'OpenAI-Compatible Gateway',
    shortLabel: 'OpenAI API',
    icon: 'solar:cloud-linear',
    connectionMode: 'gateway',
    gatewayUrl: process.env.OPENAI_COMPATIBLE_GATEWAY_URL || process.env.AGENT_GATEWAY_URL || 'http://localhost:11434',
    description:
      'Ollama, LM Studio, vLLM, LocalAI, or any gateway that exposes OpenAI-compatible /v1 endpoints.',
    paperclipPattern:
      'Paperclip keeps this as adapter config rather than hardcoded provider logic: URL, key, model, and invocation behavior are data.',
    capabilities: ['gateway-probe', 'model-discovery', 'bearer-auth'],
    healthEndpoints: ['/v1/models', '/health', '/api/status', '/'],
    configFields: [
      ...commonGatewayFields,
      {
        key: 'model',
        label: 'Default model',
        type: 'text',
        placeholder: 'llama3.1, gpt-4.1, local-model',
        helper: 'Optional default model for future chat/control surfaces.',
      },
    ],
    safetyNotes: [
      'Model gateways are not necessarily agent runtimes; use them for inference until an agent wrapper exists.',
    ],
  },
  {
    agentType: 'http',
    adapterType: 'http_webhook',
    label: 'HTTP Webhook Agent',
    shortLabel: 'Webhook',
    icon: 'solar:link-circle-linear',
    connectionMode: 'webhook',
    gatewayUrl: process.env.AGENT_WEBHOOK_URL || process.env.AGENT_GATEWAY_URL || 'http://localhost:8080',
    description:
      'Generic fire-and-forget webhook/API adapter for agents that expose a wake endpoint.',
    paperclipPattern:
      'Paperclip’s generic HTTP adapter sends a payload containing run id, agent id, and context. UNOX stores the same adapter-shape now and can invoke it later.',
    capabilities: ['gateway-probe', 'webhook-invocation', 'bearer-auth'],
    healthEndpoints: ['/health', '/api/health', '/status', '/'],
    configFields: [
      ...commonGatewayFields,
      {
        key: 'method',
        label: 'HTTP method',
        type: 'text',
        placeholder: 'POST',
        helper: 'Future invocation method. Defaults to POST.',
      },
      {
        key: 'payloadTemplate',
        label: 'Payload template',
        type: 'textarea',
        placeholder: '{ "source": "unox", "action": "heartbeat" }',
        helper: 'Optional JSON shape to merge with UNOX runtime context in future invocations.',
      },
    ],
    safetyNotes: [
      'Webhook agents should be idempotent; retries can otherwise duplicate work.',
      'Use auth even on private networks if the endpoint mutates state.',
    ],
  },
  {
    agentType: 'process',
    adapterType: 'local_process',
    label: 'Local Process Agent',
    shortLabel: 'Process',
    icon: 'solar:terminal-linear',
    connectionMode: 'command',
    gatewayUrl: 'process://local',
    description:
      'Local command/script adapter for agents that are launched as a process rather than reached over HTTP.',
    paperclipPattern:
      'Paperclip’s process adapter persists command, args, cwd, env, timeout, and logs. UNOX captures the same harness contract without auto-executing arbitrary commands from setup.',
    capabilities: ['command-invocation', 'runtime-logs'],
    healthEndpoints: [],
    configFields: [
      {
        key: 'command',
        label: 'Command',
        type: 'text',
        required: true,
        placeholder: 'python3 /path/to/agent.py',
        helper: 'Stored as configuration only. Execution should require explicit operator action.',
      },
      {
        key: 'args',
        label: 'Arguments',
        type: 'text',
        placeholder: '--workspace ~/project --once',
      },
      {
        key: 'cwd',
        label: 'Working directory',
        type: 'path',
        placeholder: '~/projects/my-agent',
      },
      {
        key: 'timeoutSec',
        label: 'Timeout seconds',
        type: 'number',
        placeholder: '300',
      },
    ],
    safetyNotes: [
      'Do not auto-run arbitrary process adapters from onboarding.',
      'Treat command execution as a separate explicit action with logs and cancellation.',
    ],
  },
  {
    agentType: 'custom',
    adapterType: 'custom_agent_gateway',
    label: 'Custom Agent Gateway',
    shortLabel: 'Custom',
    icon: 'solar:code-circle-linear',
    connectionMode: 'gateway',
    gatewayUrl: process.env.AGENT_GATEWAY_URL || 'http://localhost:11434',
    description:
      'Fallback for custom agent-control gateways. Start with health probing, then specialize into HTTP or process once the contract is known.',
    paperclipPattern:
      'Paperclip’s strongest idea is not the built-ins; it is treating runtime-specific details as adapter config. Custom keeps that door open.',
    capabilities: ['gateway-probe', 'bearer-auth'],
    healthEndpoints: ['/health', '/v1/models', '/api/health', '/api/status', '/'],
    configFields: [
      ...commonGatewayFields,
      {
        key: 'homePath',
        label: 'Optional local home path',
        type: 'path',
        placeholder: '~/.agent',
        envVars: ['AGENT_HOME'],
      },
    ],
    safetyNotes: ['Promote recurring custom setups into a named adapter instead of leaving them vague forever.'],
  },
];

export function getHarnessPreset(agentType: AgentType): HarnessPreset {
  return HARNESS_PRESETS.find((preset) => preset.agentType === agentType) ?? HARNESS_PRESETS[0];
}

export function isAgentType(value: unknown): value is AgentType {
  return typeof value === 'string' && HARNESS_PRESETS.some((preset) => preset.agentType === value);
}

export function defaultLabel(type: AgentType): string {
  return getHarnessPreset(type).label;
}
