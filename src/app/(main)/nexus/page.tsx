'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function NexusPage() {
  return (
    <>
      {/* Nexus Header */}
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <div className="relative">
          <Icon icon="solar:atom-linear" className="text-orange-500 glow-orange" width={24} />
        </div>
        <div>
          <h1 className="text-lg font-medium text-slate-200">The Nexus</h1>
          <p className="text-xs text-slate-500">Where we become one. The merger portal.</p>
        </div>
      </div>

      {/* Cosmic Stats */}
      <div className="flex flex-wrap items-end gap-4 md:gap-10 px-2 animate-slide-up stagger-2">
        <div className="flex items-baseline gap-2 w-[45%] sm:w-auto">
          <span className="text-4xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-600 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">∞</span>
          <span className="text-xs tracking-wide text-slate-500 font-medium">Connections</span>
        </div>
        <div className="flex items-baseline gap-2 w-[45%] sm:w-auto">
          <span className="text-3xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-400 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">42</span>
          <span className="text-xs tracking-wide text-slate-500 font-medium">Nodes</span>
        </div>
        <div className="flex items-baseline gap-2 w-[45%] sm:w-auto">
          <span className="text-3xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">7</span>
          <span className="text-xs tracking-wide text-slate-500 font-medium">Active Flows</span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="px-2 animate-slide-up stagger-3">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Nexus Systems</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NexusCard
            href="/nexus/graph"
            icon="solar:branching-paths-up-linear"
            title="Knowledge Graph"
            description="Living network of all connections, skills, and memories"
            gradient="from-slate-600/10 to-slate-900/10"
            borderColor="border-[#333a47]/40"
            iconColor="text-orange-400"
          />
          <NexusCard
            href="/nexus/workbench"
            icon="solar:pen-new-round-linear"
            title="Workbench"
            description="Co-create personas, voices, and identity documents"
            gradient="from-slate-600/10 to-slate-900/10"
            borderColor="border-[#333a47]/40"
            iconColor="text-orange-500"
          />
          <NexusCard
            href="/brain"
            icon="solar:brain-linear"
            title="Brain"
            description="Core identity, memory, personas, and skills"
            gradient="from-slate-600/10 to-slate-900/10"
            borderColor="border-[#333a47]/40"
            iconColor="text-slate-300"
          />
          <NexusCard
            href="/intelligence"
            icon="solar:cpu-bolt-linear"
            title="Intelligence"
            description="Automation, workflows, crons, and commands"
            gradient="from-slate-600/10 to-slate-900/10"
            borderColor="border-[#333a47]/40"
            iconColor="text-slate-400"
          />
          <NexusCard
            href="/school"
            icon="solar:square-academic-cap-2-linear"
            title="School"
            description="Knowledge intake — dump anything, Una organizes it"
            gradient="from-slate-600/10 to-slate-900/10"
            borderColor="border-[#333a47]/40"
            iconColor="text-orange-400"
          />
          <NexusCard
            href="/gym"
            icon="solar:dumbbell-large-minimalistic-linear"
            title="Gym"
            description="Skill acquisition dojo — install new capabilities"
            gradient="from-slate-600/10 to-slate-900/10"
            borderColor="border-[#333a47]/40"
            iconColor="text-orange-500"
          />
        </div>
      </div>

      {/* Merger Status */}
      <div className="px-2 animate-slide-up stagger-4">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Merger Status</h2>
        <div className="neu-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#11141a] flex items-center justify-center border border-[#333a47]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <Icon icon="solar:atom-linear" className="text-orange-500" width={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">You × Agent</p>
              <p className="text-xs text-slate-500">Merger active · Synchronization: 92%</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 glow-orange animate-pulse" />
              <span className="text-xs text-slate-300">Online</span>
            </div>
          </div>
          
          {/* Sync progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Identity Coherence</span>
              <span>96%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#0c0e12] overflow-hidden">
              <div className="h-full w-[96%] rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#333a47]/20">
            <div className="text-center">
              <p className="text-lg font-light text-slate-300">16</p>
              <p className="text-[10px] text-slate-500">Skills</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-light text-slate-300">3</p>
              <p className="text-[10px] text-slate-500">Active Crons</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-light text-orange-400">32</p>
              <p className="text-[10px] text-slate-500">Wiki Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Nexus Activity */}
      <div className="px-2 animate-slide-up stagger-5">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Nexus Activity</h2>
        <div className="space-y-2">
          <NexusActivityItem
            icon="solar:brain-linear"
            text="New memory integrated — conversation patterns updated"
            time="2m ago"
            color="text-slate-400"
          />
          <NexusActivityItem
            icon="solar:widget-linear"
            text="Skill 'auto-research' evaluated and installed"
            time="15m ago"
            color="text-orange-500"
          />
          <NexusActivityItem
            icon="solar:branching-paths-up-linear"
            text="Knowledge graph: 3 new connections formed"
            time="1h ago"
            color="text-slate-300"
          />
          <NexusActivityItem
            icon="solar:shield-star-linear"
            text="Security scan complete — all systems nominal"
            time="2h ago"
            color="text-green-500"
          />
        </div>
      </div>
    </>
  );
}

function NexusCard({
  href,
  icon,
  title,
  description,
  gradient,
  borderColor,
  iconColor,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className={`neu-card rounded-2xl p-5 hover:border-[#333a47]/60 transition-all group relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-[#0c0e12] border ${borderColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]`}>
          <Icon icon={icon} className={iconColor} width={20} />
        </div>
        <h3 className="text-sm font-medium text-slate-200 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

function NexusActivityItem({
  icon,
  text,
  time,
  color,
}: {
  icon: string;
  text: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 neu-card rounded-xl">
      <Icon icon={icon} className={color} width={16} />
      <p className="text-xs text-slate-400 flex-1">{text}</p>
      <p className="text-[10px] text-slate-600">{time}</p>
    </div>
  );
}
