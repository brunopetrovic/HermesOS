import { z } from 'zod';

export const instanceKeySchema = z.enum(['personal', 'brand', 'business', 'nexus']);
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'blocked', 'done']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const goalStatusSchema = z.enum(['active', 'paused', 'completed', 'abandoned']);
export const runStatusSchema = z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled']);

export const syncPushSchema = z.object({
  type: z.enum(['tasks', 'goals', 'calendar', 'contacts']),
  data: z.array(z.unknown()).max(500),
});

export const syncTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(10_000).optional().nullable(),
  status: taskStatusSchema.optional().default('todo'),
  priority: taskPrioritySchema.optional().default('medium'),
  column: z.string().max(80).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  instance: instanceKeySchema.default('personal'),
});

export const syncGoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(10_000).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().default(0),
  status: goalStatusSchema.optional().default('active'),
  deadline: z.string().datetime().optional().nullable(),
  instance: instanceKeySchema.default('personal'),
});

export const runCreateSchema = z.object({
  agentType: z.string().min(1).max(80),
  config: z.record(z.string(), z.unknown()).optional().default({}),
});

export function parseJsonObject(value: string | null | undefined): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
