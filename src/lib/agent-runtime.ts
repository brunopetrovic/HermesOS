import 'server-only';
import { getConnection, probeGateway } from '@/lib/connection';
import { prisma } from '@/lib/db';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentStatus {
  ok: boolean;
  status: number | null;
  detail: string;
  agentType: string;
  label: string;
}

/**
 * Universal Agent Runtime proxy layer.
 * Routes chat requests, stream tokens, models list, and runs executions
 * based on the connected agent's connection state.
 */
export const AgentRuntime = {
  /**
   * Retrieves connection health and status
   */
  async getStatus(): Promise<AgentStatus> {
    const conn = await getConnection();
    if (!conn) {
      return {
        ok: false,
        status: null,
        detail: 'No agent connection configured. Run onboarding.',
        agentType: 'none',
        label: 'Disconnected',
      };
    }

    try {
      const probe = await probeGateway(conn.gatewayUrl, conn.apiKey);
      return {
        ok: probe.ok,
        status: probe.status,
        detail: probe.detail,
        agentType: conn.agentType,
        label: conn.label,
      };
    } catch (error) {
      return {
        ok: false,
        status: null,
        detail: error instanceof Error ? error.message : 'Connection failed',
        agentType: conn.agentType,
        label: conn.label,
      };
    }
  },

  /**
   * Discovers available LLM models on the connected gateway
   */
  async getModels(): Promise<string[]> {
    const conn = await getConnection();
    if (!conn || !conn.gatewayUrl) {
      return ['default-local-model'];
    }

    // Default presets for local/offline modes
    const defaultModels: Record<string, string[]> = {
      hermes: ['hermes-3-llama-3.1-8b', 'hermes-2-pro-mistral-7b'],
      openclaw: ['openclaw-llama3-8b', 'openclaw-mixtral-8x7b'],
      openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (conn.apiKey) headers.Authorization = `Bearer ${conn.apiKey}`;

      const res = await fetch(`${conn.gatewayUrl}/v1/models`, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          return data.data.map((m: { id: string }) => m.id);
        }
      }
    } catch {
      // Fallback to defaults on timeout/error
    }

    return defaultModels[conn.agentType] || ['local-agent-model'];
  },

  /**
   * Sends a synchronous chat message to the connected gateway
   */
  async sendMessage(messages: ChatMessage[], options?: { model?: string }): Promise<ChatMessage> {
    const conn = await getConnection();
    if (!conn || !conn.gatewayUrl) {
      return this.simulateChat(messages);
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (conn.apiKey) headers.Authorization = `Bearer ${conn.apiKey}`;

      const models = await this.getModels();
      const model = options?.model || models[0] || 'default';

      const res = await fetch(`${conn.gatewayUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gateway returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== 'string') {
        throw new Error('Invalid chat response format from agent gateway');
      }

      return {
        role: 'assistant',
        content: text,
      };
    } catch (err) {
      console.warn('Real agent connection failed, falling back to simulation:', err);
      return this.simulateChat(messages);
    }
  },

  /**
   * Helper to simulate responses when no local agent is running
   */
  simulateChat(messages: ChatMessage[]): ChatMessage {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    let response = "I am running in offline demonstration mode because no local agent gateway was detected. Start your agent or run onboarding to connect.";
    
    if (lastUserMsg.toLowerCase().includes('status')) {
      response = "SYSTEM STATUS:\n- Gateway connection: DISCONNECTED\n- Memory usage: 0% (Offline)\n- Workflows: 0 active\n- Action: Run `npm run setup` and verify your local agent is running.";
    } else if (lastUserMsg.toLowerCase().includes('hello') || lastUserMsg.toLowerCase().includes('hi')) {
      response = "Greetings! I'm HermesOS, your local agent command center. Let me know when you connect a gateway so I can proxy your commands to it.";
    }

    return {
      role: 'assistant',
      content: response,
    };
  },

  /**
   * Spawns an AgentRun tracking record in the local SQLite database
   */
  async executeRun(
    agentType: string,
    config: { title?: string; input?: string; parameters?: Record<string, unknown> },
    userId?: string
  ) {
    const start = Date.now();
    const run = await prisma.agentRun.create({
      data: {
        userId,
        agentType,
        status: 'running',
        config: JSON.stringify(config),
        logs: `[${new Date().toISOString()}] Initializing universal executor run...\n`,
        events: {
          create: {
            type: 'queued',
            label: 'Run initialized',
            detail: config.title || 'Untitled agent execution',
            metadata: JSON.stringify({ agentType, input: config.input || null }),
          },
        },
      },
    });

    try {
      const conn = await getConnection();
      let logs = run.logs || '';
      let finalStatus = 'succeeded';
      let tokens = 0;

      if (!conn || !conn.gatewayUrl) {
        logs += `[${new Date().toISOString()}] Warning: Running in offline simulation.\n`;
        logs += `[${new Date().toISOString()}] Executing task: "${config.title || 'Untitled'}"\n`;
        logs += `[${new Date().toISOString()}] Input context: "${config.input || ''}"\n`;
        logs += `[${new Date().toISOString()}] Finalizing offline pipeline success.\n`;
        tokens = 45;
        await prisma.agentRunEvent.create({
          data: {
            runId: run.id,
            type: 'gateway',
            label: 'Offline simulation path',
            detail: 'No local agent gateway was configured, so the run completed as an auditable local simulation.',
            severity: 'warning',
          },
        });
      } else {
        logs += `[${new Date().toISOString()}] Resolved connection to gateway: ${conn.gatewayUrl}\n`;
        // Send a run payload to agent if it supports run triggers
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30_000);
          try {
            const res = await fetch(`${conn.gatewayUrl}/api/run`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(conn.apiKey ? { Authorization: `Bearer ${conn.apiKey}` } : {}),
              },
              body: JSON.stringify(config),
              signal: controller.signal,
            });
            if (res.ok) {
              const data = await res.json();
              logs += `[${new Date().toISOString()}] Gateway response: ${JSON.stringify(data)}\n`;
              tokens = data.usage?.total_tokens || 120;
              await prisma.agentRunEvent.create({
                data: {
                  runId: run.id,
                  type: 'gateway',
                  label: 'Gateway accepted run',
                  detail: 'The connected gateway returned a successful response.',
                  severity: 'success',
                  metadata: JSON.stringify(data),
                },
              });
            } else {
              logs += `[${new Date().toISOString()}] Gateway returned error: HTTP ${res.status}\n`;
              finalStatus = 'failed';
              await prisma.agentRunEvent.create({
                data: {
                  runId: run.id,
                  type: 'error',
                  label: 'Gateway returned error',
                  detail: `HTTP ${res.status}`,
                  severity: 'error',
                },
              });
            }
          } finally {
            clearTimeout(timeout);
          }
        } catch (err) {
          const message = err instanceof Error ? err.name === 'AbortError' ? 'Aborted after 30s timeout' : err.message : 'Unknown error';
          logs += `[${new Date().toISOString()}] Agent execution connection failed: ${message}\n`;
          finalStatus = 'failed';
          await prisma.agentRunEvent.create({
            data: {
              runId: run.id,
              type: 'error',
              label: 'Agent execution connection failed',
              detail: message,
              severity: 'error',
            },
          });
        }
      }

      const duration = Date.now() - start;
      const updated = await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: finalStatus,
          duration,
          tokenCount: tokens,
          cost: tokens * 0.00001, // rough estimate
          logs: logs + `[${new Date().toISOString()}] Run completed with status: ${finalStatus} in ${duration}ms.`,
        },
      });

      // Audit log the execution
      await prisma.agentRunEvent.create({
        data: {
          runId: run.id,
          type: 'completed',
          label: `Run ${finalStatus}`,
          detail: `Completed in ${duration}ms with ${tokens} estimated tokens.`,
          severity: finalStatus === 'succeeded' ? 'success' : 'error',
          metadata: JSON.stringify({ duration, tokens, status: finalStatus }),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'agent_run_execution',
          targetType: 'AgentRun',
          targetId: run.id,
          payload: JSON.stringify({ status: finalStatus, duration }),
        },
      });

      return updated;
    } catch (error) {
      const duration = Date.now() - start;
      return await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          duration,
          logs: (run.logs || '') + `[${new Date().toISOString()}] Fatal Execution Error: ${error instanceof Error ? error.message : 'Unknown'}\n`,
        },
      });
    }
  },
};
