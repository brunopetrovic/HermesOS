'use client';

import { useHermesStore } from '@/lib/store/hermes-store';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function MemoryStatusWidget() {
  const memoryL1 = useHermesStore(s => s.memoryL1);
const memoryL1Usage = useHermesStore(s => s.memoryL1Usage);
const memoryL2 = useHermesStore(s => s.memoryL2);
const memoryL3 = useHermesStore(s => s.memoryL3);
const memoryLoading = useHermesStore(s => s.memoryLoading);
const fetchMemory = useHermesStore(s => s.fetchMemory);;

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const hasData = memoryL1.length > 0 || memoryL2.exists || memoryL3.length > 0;

  return (
    <div className="neu-card rounded-2xl p-4 md:p-5 hover:border-orange-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Memory System</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono">3-tier</span>
          <button onClick={fetchMemory} className="text-slate-600 hover:text-orange-400 transition-colors">
            <Icon icon="solar:refresh-linear" width={14} className={memoryLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {memoryLoading && !hasData ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center py-8 text-slate-600 text-sm italic">
          Memory system unavailable
        </div>
      ) : (
        <div className="space-y-5">
          {/* L1 — Working Memory */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <Icon icon="solar:brain-linear" className="text-orange-400" width={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200">L1 — Working</p>
                <p className="text-[10px] text-slate-500">Core identity & user context</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {Math.round(memoryL1Usage)}% used
              </span>
            </div>
            {/* Usage bar */}
            <div className="h-1.5 w-full rounded-full progress-track p-0.5">
              <div
                className="h-full rounded-full progress-fill transition-all duration-500"
                style={{ width: `${memoryL1Usage}%` }}
              />
            </div>
            {/* File breakdown */}
            {memoryL1.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-600 font-mono pl-1">
                {memoryL1.map((f) => (
                  <span key={f.name}>{f.name}: {Math.round(f.usage || 0)}%</span>
                ))}
              </div>
            )}
          </div>

          {/* L2 — Semantic */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Icon icon="solar:database-linear" className="text-emerald-400" width={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200">L2 — Semantic</p>
              <p className="text-[10px] text-slate-500">Holographic fact store</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">{(memoryL2.size / 1024).toFixed(1)} KB</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded border',
                memoryL2.exists
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#1a1d24] text-slate-600 border-[#333a47]/40'
              )}>
                {memoryL2.exists ? 'active' : 'empty'}
              </span>
            </div>
          </div>

          {/* L3 — Episodic */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Icon icon="solar:folder-with-files-linear" className="text-indigo-400" width={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200">L3 — Episodic</p>
                <p className="text-[10px] text-slate-500">
                  {memoryL3.length} files — consolidations, REM, briefings
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {(memoryL3.reduce((a, f) => a + (f.size || 0), 0) / 1024).toFixed(1)} KB
              </span>
            </div>
            {memoryL3.slice(0, 3).map((f) => (
              <div key={f.name} className="flex items-center justify-between pl-8 text-[10px]">
                <span className="text-slate-500 font-mono truncate">{f.name}</span>
                <span className="text-slate-600 shrink-0 ml-2">{(f.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
            {memoryL3.length > 3 && (
              <p className="text-[10px] text-slate-600 pl-8">
                +{memoryL3.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
