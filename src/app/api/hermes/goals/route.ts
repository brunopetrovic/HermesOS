import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConnection } from '@/lib/connection';

interface HermesGoal {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'blocked' | 'paused';
  priority: number;
  created: string;
  updated: string;
  tasks: HermesTask[];
  blockers: string[];
  progress: number;
}

interface HermesTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee?: string;
}

interface GoalsFile {
  goals: HermesGoal[];
  dormant_tasks?: HermesTask[];
}

export async function GET() {
  const conn = await getConnection();
  const HERMES_HOME = conn?.homePath || path.join(process.env.HOME || '', '.hermes');

  try {
    const goalsPath = path.join(HERMES_HOME, 'memories', 'goals.json');
    
    let goalsData: GoalsFile = { goals: [], dormant_tasks: [] };
    
    try {
      const content = await fs.readFile(goalsPath, 'utf-8');
      goalsData = JSON.parse(content);
    } catch {
      // File doesn't exist yet — return empty
      return NextResponse.json({
        goals: [],
        dormantTasks: [],
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        averageProgress: 0,
        source: 'hermes-native',
        lastSync: new Date().toISOString(),
      });
    }

    // Compute stats
    const goals = goalsData.goals || [];
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
      : 0;

    // Count total tasks across all goals
    const totalTasks = goals.reduce((sum, g) => sum + (g.tasks?.length || 0), 0);
    const completedTasks = goals.reduce(
      (sum, g) => sum + (g.tasks?.filter(t => t.status === 'completed')?.length || 0), 0
    );

    return NextResponse.json({
      goals: goals.map(g => ({
        ...g,
        taskCount: g.tasks?.length || 0,
        completedTaskCount: g.tasks?.filter(t => t.status === 'completed')?.length || 0,
      })),
      dormantTasks: goalsData.dormant_tasks || [],
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      blockedGoals: goals.filter(g => g.status === 'blocked').length,
      averageProgress: avgProgress,
      totalTasks,
      completedTasks,
      source: 'hermes-native',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Hermes Goals Error:', error);
    return NextResponse.json({ error: 'Failed to read Hermes goals' }, { status: 500 });
  }
}
