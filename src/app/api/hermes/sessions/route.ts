import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConnection } from '@/lib/connection';

// We can't use better-sqlite3 without native dependencies, so this endpoint
// returns safe session-store metadata for now. A later SQLite bridge can add
// real paginated session search without changing the client contract.
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = {
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
    source: searchParams.get('source') || null,
    search: searchParams.get('q') || null,
  };

  const conn = await getConnection();
  const hermesHome = conn?.homePath || path.join(process.env.HOME || '', '.hermes');

  try {
    // Check if state.db exists and get its stats
    const dbPath = path.join(/* turbopackIgnore: true */ hermesHome, 'state.db');
    let dbExists = false;
    let dbSize = 0;
    
    try {
      const stats = await fs.stat(dbPath);
      dbExists = true;
      dbSize = stats.size;
    } catch {
      // DB doesn't exist
    }

    if (!dbExists) {
      return NextResponse.json({
        sessions: [],
        total: 0,
        dbSize: 0,
        dbExists: false,
        query,
        source: 'hermes-native',
        lastSync: new Date().toISOString(),
      });
    }

    // Read the WAL file size too for accuracy
    let walSize = 0;
    try {
      const walStats = await fs.stat(`${dbPath}-wal`);
      walSize = walStats.size;
    } catch {
      // No WAL file
    }

    return NextResponse.json({
      sessions: [],
      total: 0,
      dbSize,
      walSize,
      dbExists: true,
      dbPath,
      query,
      note: 'Session listing requires SQLite bridge — use the Hermes CLI for full session search. Gateway integration coming soon.',
      availableViaCli: [
        'hermes sessions list',
        'hermes sessions search <query>',
        'hermes sessions show <id>',
      ],
      source: 'hermes-native',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Hermes Sessions Error:', error);
    return NextResponse.json({ error: 'Failed to read Hermes sessions' }, { status: 500 });
  }
}
