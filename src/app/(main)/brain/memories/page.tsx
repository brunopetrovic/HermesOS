'use client';

import { Icon } from '@iconify/react';
import { useHermesStore } from '@/lib/store/hermes-store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect } from 'react';

export default function BrainMemoriesPage() {
  const { memoryL1, memoryL1Usage, memoryL2, memoryL3, memoryLoading, fetchMemory } = useHermesStore(
    useShallow(s => ({
      memoryL1: s.memoryL1,
      memoryL1Usage: s.memoryL1Usage,
      memoryL2: s.memoryL2,
      memoryL3: s.memoryL3,
      memoryLoading: s.memoryLoading,
      fetchMemory: s.fetchMemory,
    }))
  );

  useEffect(() => { fetchMemory(); }, []);

  return (
    <>
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <Icon icon="solar:database-linear" className="text-orange-500 glow-orange" width={22} />
        <div>
          <h1 className="text-lg font-medium text-slate-200">Memories</h1>
          <p className="text-xs text-slate-500">Central memory library — L1, L2, L3 tiers</p>
        </div>
      </div>

      {/* Memory tier cards */}
      <div className="px-2 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up stagger-2">
        <div className="neu-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="solar:flash-drive-linear" className="text-amber-400" width={18} />
            <h3 className="text-sm font-medium text-slate-200">L1 — Working</h3>
          </div>
          <p className="text-2xl font-light text-amber-400">{memoryL1.length}</p>
          <p className="text-[10px] text-slate-600">files · {Math.round(memoryL1Usage)}% usage</p>
          <div className="mt-3 h-1.5 rounded-full progress-track p-0.5">
            <div className="h-full rounded-full progress-fill" style={{ width: `${memoryL1Usage}%` }} />
          </div>
        </div>
        <div className="neu-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="solar:database-linear" className="text-sky-400" width={18} />
            <h3 className="text-sm font-medium text-slate-200">L2 — Facts</h3>
          </div>
          <p className="text-2xl font-light text-sky-400">{memoryL2.factCount}</p>
          <p className="text-[10px] text-slate-600">facts stored</p>
        </div>
        <div className="neu-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="solar:archive-linear" className="text-violet-400" width={18} />
            <h3 className="text-sm font-medium text-slate-200">L3 — Archive</h3>
          </div>
          <p className="text-2xl font-light text-violet-400">{memoryL3.length}</p>
          <p className="text-[10px] text-slate-600">archived files</p>
        </div>
      </div>

      {/* L1 Files */}
      <div className="px-2 animate-slide-up stagger-3">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Working Memory (L1)</h2>
        <div className="space-y-2">
          {memoryLoading ? (
            <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
          ) : memoryL1.map((file) => (
            <div key={file.name} className="neu-card rounded-xl p-4 flex items-center gap-3">
              <Icon icon="solar:document-text-linear" className="text-amber-400 shrink-0" width={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 font-mono truncate">{file.name}</p>
                <p className="text-[10px] text-slate-600">{(file.size / 1024).toFixed(1)} KB / {(file.maxSize / 1024).toFixed(1)} KB</p>
              </div>
              <div className="w-16 h-1 rounded-full progress-track">
                <div className="h-full rounded-full progress-fill" style={{ width: `${file.usage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
