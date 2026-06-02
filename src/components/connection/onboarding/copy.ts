'use client';

import type { AgentType } from '@/lib/agent-harnesses';
import type { PresetClientShape } from './types';

export const AGENT_COPY: Record<AgentType, { title: string; helper: string; icon: string; color: string }> = {
  hermes: {
    title: 'Hermes Agent',
    helper: 'Local Hermes adapter: gateway + optional home-path sync for memory, skills, crons, sessions, and status.',
    icon: 'solar:bolt-circle-linear',
    color: 'from-amber-500 to-orange-600',
  },
  openclaw: {
    title: 'OpenClaw Gateway',
    helper: 'Gateway adapter for OpenClaw / Claw-compatible agents that wake through an HTTP control plane.',
    icon: 'solar:widget-5-linear',
    color: 'from-emerald-500 to-teal-600',
  },
  openai: {
    title: 'OpenAI-compatible gateway',
    helper: 'For Ollama, LM Studio, vLLM, LocalAI, or any model gateway exposing /v1 endpoints.',
    icon: 'solar:cloud-linear',
    color: 'from-blue-500 to-indigo-600',
  },
  http: {
    title: 'HTTP Webhook Agent',
    helper: 'Generic webhook/API adapter for agents with a wake endpoint.',
    icon: 'solar:link-circle-linear',
    color: 'from-purple-500 to-pink-600',
  },
  process: {
    title: 'Local Process Agent',
    helper: 'Command/script harness. Saved as config only; setup never auto-runs arbitrary commands.',
    icon: 'solar:terminal-linear',
    color: 'from-slate-500 to-slate-700',
  },
  custom: {
    title: 'Custom Agent Gateway',
    helper: 'Fallback for custom local or private-network agent control APIs.',
    icon: 'solar:code-circle-linear',
    color: 'from-rose-500 to-red-600',
  },
};

export function defaultAdapterConfig(agentType: AgentType, preset?: PresetClientShape | null) {
  if (agentType === 'process') return { command: '', args: '', cwd: '', timeoutSec: 300 };
  if (agentType === 'http') return { method: 'POST', payloadTemplate: { source: 'unox', action: 'heartbeat' } };
  if (agentType === 'hermes') return { command: 'hermes', profile: 'default' };
  if (agentType === 'openai') return { model: '' };
  return preset?.adapterType ? { adapterType: preset.adapterType } : {};
}

export function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
