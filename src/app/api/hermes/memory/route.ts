import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConnection } from '@/lib/connection';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface MemoryFile {
  name: string;
  path: string;
  size: number;
  maxSize: number;
  content: string;
  lastModified: string;
  usage: number; // percentage
}

interface EpisodicMemory {
  name: string;
  size: number;
  lastModified: string;
  preview: string;
}

async function readMemoryFile(filePath: string, maxSize: number): Promise<MemoryFile | null> {
  try {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      name: path.basename(filePath),
      path: filePath,
      size: content.length,
      maxSize,
      content,
      lastModified: stats.mtime.toISOString(),
      usage: Math.round((content.length / maxSize) * 100),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const conn = await getConnection();
  const HERMES_HOME = conn?.homePath || path.join(process.env.HOME || '', '.hermes');

  try {
    // === L1: Working Memory (MEMORY.md + USER.md) ===
    const [memoryMd, userMd, identityMd, soulMd] = await Promise.all([
      readMemoryFile(path.join(HERMES_HOME, 'MEMORY.md'), 2200),
      readMemoryFile(path.join(HERMES_HOME, 'USER.md'), 1375),
      readMemoryFile(path.join(HERMES_HOME, 'IDENTITY.md'), 5000),
      readMemoryFile(path.join(HERMES_HOME, 'SOUL.md'), 5000),
    ]);

    // === L2: Semantic Memory (memory_store.db) ===
    let l2Stats = { exists: false, size: 0, factCount: 0 };
    try {
      const l2Path = path.join(HERMES_HOME, 'memory_store.db');
      const stats = await fs.stat(l2Path);
      l2Stats = {
        exists: true,
        size: stats.size,
        factCount: 0, // Would need SQLite to count accurately
      };
    } catch {
      // Memory store doesn't exist
    }

    // === L3: Episodic Memory (memories/*.md) ===
    const memoriesDir = path.join(HERMES_HOME, 'memories');
    let episodicMemories: EpisodicMemory[] = [];

    try {
      const files = (await fs.readdir(memoriesDir))
        .filter((f) => (f.endsWith('.md') || f.endsWith('.json')) && f !== 'goals.json')
        .sort()
        .reverse();

      const previews = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(memoriesDir, file);
          const [stats, content] = await Promise.all([
            fs.stat(filePath).catch(() => null),
            fs.readFile(filePath, 'utf-8').catch(() => ''),
          ]);
          if (!stats) return null;
          const preview = content
            .split('\n')
            .filter((line) => !line.startsWith('#') && line.trim().length > 0)
            .slice(0, 3)
            .join(' ')
            .slice(0, 200);
          return {
            name: file,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            preview,
          };
        })
      );
      episodicMemories = previews.filter((m): m is EpisodicMemory => m !== null);
    } catch {
      // Memories directory doesn't exist
    }

    return NextResponse.json({
      l1: {
        label: 'Working Memory',
        description: 'Core identity and user context injected every session',
        files: [memoryMd, userMd, identityMd, soulMd].filter(Boolean),
        totalUsage: memoryMd && userMd
          ? Math.round(((memoryMd.size + userMd.size) / (memoryMd.maxSize + userMd.maxSize)) * 100)
          : 0,
      },
      l2: {
        label: 'Semantic Memory',
        description: 'Holographic fact store with trust scores and importance weighting',
        ...l2Stats,
      },
      l3: {
        label: 'Episodic Memory',
        description: 'Session consolidations, daily briefings, and REM reports',
        files: episodicMemories,
        totalFiles: episodicMemories.length,
        totalSize: episodicMemories.reduce((sum, f) => sum + f.size, 0),
      },
      source: 'hermes-native',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Hermes Memory Error:', error);
    return NextResponse.json({ error: 'Failed to read Hermes memory' }, { status: 500 });
  }
}
