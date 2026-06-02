import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConnection } from '@/lib/connection';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function resolveHermesHome(): Promise<string> {
  const conn = await getConnection();
  return conn?.homePath || process.env.HERMES_HOME || path.join(process.env.HOME || '/home/ox', '.hermes');
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
  deliver_thread_id?: string;
  skills?: string[];
  model?: string;
  last_run_at?: string;
  last_status?: string;
  last_error?: string;
  next_run_at?: string;
  run_count?: number;
  created_at?: string;
}

function parseNextRun(schedule: string): string | null {
  // Basic cron next-run estimation for display purposes
  // Returns ISO string of approximate next run
  try {
    const parts = schedule.split(/\s+/);
    if (parts.length < 5) return null;
    
    const now = new Date();
    const [min, hour] = parts;
    
    if (min === '*' || hour === '*') return null;
    
    const nextRun = new Date(now);
    nextRun.setHours(parseInt(hour), parseInt(min), 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.toISOString();
  } catch {
    return null;
  }
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const HERMES_HOME = await resolveHermesHome();
    const jobsPath = path.join(HERMES_HOME, 'cron', 'jobs.json');
    
    let jobs: CronJob[] = [];
    
    try {
      const content = await fs.readFile(jobsPath, 'utf-8');
      const parsed = JSON.parse(content);
      
      // jobs.json can be an object with named keys or an array
      if (Array.isArray(parsed)) {
        jobs = parsed;
      } else if (typeof parsed === 'object') {
        jobs = Object.entries(parsed).map(([key, value]) => ({
          id: key,
          ...(value as Record<string, unknown>),
        })) as CronJob[];
      }
    } catch {
      return NextResponse.json({
        jobs: [],
        totalJobs: 0,
        enabledJobs: 0,
        source: 'hermes-native',
        lastSync: new Date().toISOString(),
      });
    }

    // Enrich with computed fields
    const enrichedJobs = jobs.map(job => ({
      ...job,
      nextRunEstimate: job.next_run_at || parseNextRun(job.schedule),
      scheduleHuman: describeCronSchedule(job.schedule, job.timezone),
      isOverdue: job.next_run_at ? new Date(job.next_run_at) < new Date() : false,
    }));

    const enabledJobs = enrichedJobs.filter(j => j.enabled !== false);
    const failedJobs = enrichedJobs.filter(j => j.last_status === 'error' || j.last_status === 'failed');

    return NextResponse.json({
      jobs: enrichedJobs,
      totalJobs: enrichedJobs.length,
      enabledJobs: enabledJobs.length,
      failedJobs: failedJobs.length,
      source: 'hermes-native',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Hermes Crons Error:', error);
    return NextResponse.json({ error: 'Failed to read Hermes cron jobs' }, { status: 500 });
  }
}

function describeCronSchedule(schedule: string, timezone?: string): string {
  try {
    const parts = schedule.split(/\s+/);
    if (parts.length < 5) return schedule;
    
    const [min, hour, dom, mon, dow] = parts;
    const tz = timezone || 'UTC';
    
    let desc = '';
    
    // Time
    if (hour !== '*' && min !== '*') {
      const h = parseInt(hour);
      const m = parseInt(min);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      desc += `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    } else if (hour !== '*') {
      desc += `Every min at hour ${hour}`;
    } else {
      desc += 'Every minute';
    }
    
    // Day of week
    const dowNames: Record<string, string> = {
      '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed',
      '4': 'Thu', '5': 'Fri', '6': 'Sat', '7': 'Sun',
    };
    
    if (dow !== '*') {
      if (dow.includes(',')) {
        const days = dow.split(',').map(d => dowNames[d] || d).join(', ');
        desc += ` on ${days}`;
      } else if (dow.includes('-')) {
        const [start, end] = dow.split('-');
        desc += ` ${dowNames[start] || start}–${dowNames[end] || end}`;
      } else {
        desc += ` on ${dowNames[dow] || dow}`;
      }
    }
    
    // Day of month
    if (dom !== '*') {
      desc += ` on day ${dom}`;
    }

    // Month
    if (mon !== '*') {
      desc += ` in month ${mon}`;
    }
    
    desc += ` (${tz})`;
    
    return desc;
  } catch {
    return schedule;
  }
}
