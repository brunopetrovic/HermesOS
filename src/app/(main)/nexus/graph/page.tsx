'use client';

import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { KnowledgeGraph2D } from '@/components/graph/knowledge-graph-2d';

const KnowledgeGraph3D = dynamic(
  () => import('@/components/graph/knowledge-graph-3d').then(m => m.KnowledgeGraph3D),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Loading 3D engine…</div> }
);

export default function KnowledgeGraphPage() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-2 animate-slide-up stagger-1">
        <div className="flex items-center gap-3">
          <Icon icon="solar:branching-paths-up-linear" className="text-orange-500 glow-orange" width={22} />
          <div>
            <h1 className="text-lg font-medium text-slate-200">Knowledge Graph</h1>
            <p className="text-xs text-slate-500">Living network of all connections</p>
          </div>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl p-1 bg-[#0c0e12] border border-[#333a47]/40 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === '2d'
                ? 'bg-[#1a1d24] text-orange-400 border border-[#333a47]/60'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === '3d'
                ? 'bg-[#1a1d24] text-orange-400 border border-[#333a47]/60'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* Graph Viewport */}
      <div className="flex-1 px-2 animate-slide-up stagger-2">
        <div className="neu-card rounded-2xl h-[60vh] min-h-[400px] relative overflow-hidden">
          {viewMode === '2d' ? (
            <KnowledgeGraph2D />
          ) : (
            <KnowledgeGraph3D />
          )}

          {/* Decorative nodes */}
          <div className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-slate-500/20 animate-pulse" />
          <div className="absolute top-[40%] left-[60%] w-2 h-2 rounded-full bg-orange-400/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[70%] left-[30%] w-2.5 h-2.5 rounded-full bg-slate-400/20 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[30%] left-[80%] w-2 h-2 rounded-full bg-orange-500/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[60%] left-[70%] w-3 h-3 rounded-full bg-slate-500/20 animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Decorative connection lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="15%" y1="20%" x2="60%" y2="40%" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
            <line x1="60%" y1="40%" x2="30%" y2="70%" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
            <line x1="30%" y1="70%" x2="70%" y2="60%" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
            <line x1="80%" y1="30%" x2="60%" y2="40%" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Graph Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-2 animate-slide-up stagger-3">
        {[
          { label: 'Nodes', value: '42', icon: 'solar:point-on-map-linear', color: 'text-orange-400' },
          { label: 'Edges', value: '87', icon: 'solar:link-minimalistic-2-linear', color: 'text-slate-400' },
          { label: 'Clusters', value: '6', icon: 'solar:folder-open-linear', color: 'text-orange-500' },
          { label: 'Strength', value: '73%', icon: 'solar:bolt-linear', color: 'text-slate-300' },
        ].map((stat) => (
          <div key={stat.label} className="neu-card rounded-xl p-4">
            <Icon icon={stat.icon} className={stat.color} width={16} />
            <p className="text-xs text-slate-500 mt-2">{stat.label}</p>
            <p className="text-xl font-light text-slate-200 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
