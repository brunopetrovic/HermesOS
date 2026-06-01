'use client';

import { Icon } from '@iconify/react';
import { SystemStatusWidget } from '@/components/hermes/system-status-widget';
import { HermesGoalsWidget } from '@/components/hermes/hermes-goals-widget';
import { CronJobsWidget } from '@/components/hermes/cron-jobs-widget';
import { MemoryStatusWidget } from '@/components/hermes/memory-status-widget';

// Task cards data
const backlogTasks = [
  { id: '1', title: 'Record Claude Code session', desc: 'Film the I deleted all my AI tools video', agent: 'A', agentColor: 'text-emerald-400', tag: 'YouTube', tagColor: 'text-red-400', priority: 'high' },
  { id: '2', title: 'Flesh out $10K Mac upgrade plan', desc: 'Develop and prioritize the use cases for the Mac Studio M3 Ultra upgrade', agent: 'A', agentColor: 'text-emerald-400', tag: 'Clawdbot', tagColor: 'text-indigo-400', priority: 'medium' },
  { id: '3', title: 'Pre-train a local model', desc: '', agent: 'A', agentColor: 'text-emerald-400', tag: '', tagColor: '', priority: 'medium' },
];

const inProgressTasks = [
  { id: '4', title: 'Build Council system', desc: 'Multi-model deliberation system. Phase 1: CLI backend. Phase 2: UI...', agent: 'H', agentColor: 'text-purple-400', tag: 'Council', tagColor: 'text-slate-400', priority: 'high' },
];

export default function PersonalPage() {
  return (
    <>
      {/* Stats Row */}
      <div className="flex flex-wrap items-end gap-4 md:gap-10 px-2">
        <div className="flex items-baseline gap-2 md:gap-3 w-[45%] sm:w-auto">
          <span className="text-4xl md:text-5xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-600 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">19</span>
          <span className="text-xs md:text-sm tracking-wide text-slate-500 font-medium">This week</span>
        </div>
        <div className="flex items-baseline gap-2 md:gap-3 w-[45%] sm:w-auto">
          <span className="text-3xl md:text-4xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">3</span>
          <span className="text-xs md:text-sm tracking-wide text-slate-500 font-medium whitespace-nowrap">In progress</span>
        </div>
        <div className="flex items-baseline gap-2 md:gap-3 w-[45%] sm:w-auto">
          <span className="text-3xl md:text-4xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">42</span>
          <span className="text-xs md:text-sm tracking-wide text-slate-500 font-medium">Total</span>
        </div>

        {/* Progress fader */}
        <div className="flex flex-col gap-2 ml-0 sm:ml-auto w-full sm:w-48 pt-2 md:pt-0 shrink-0">
          <div className="flex justify-between items-end">
            <span className="text-2xl md:text-3xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#a3b1c6] to-[#5a6b8c] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">45%</span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-medium mb-1.5">Completion</span>
          </div>
          <div className="h-2 w-full rounded-full progress-track p-0.5">
            <div className="h-full w-[45%] rounded-full progress-fill" />
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 px-2">
        <button className="relative rounded-xl neu-inset p-1.5 group w-full sm:w-auto shrink-0">
          <div className="px-5 py-2 rounded-lg neu-raised flex items-center justify-center gap-2 group-active:translate-y-px transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />
            <Icon icon="solar:add-circle-linear" className="text-orange-500 glow-orange relative z-10" width={20} />
            <span className="text-sm font-medium text-slate-200 relative z-10">New task</span>
          </div>
        </button>

        <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-[#333a47] to-transparent mx-1 md:mx-2" />

        <button className="px-3 md:px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Mine</button>
        <button className="px-3 md:px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Agent</button>

        <button className="sm:ml-auto md:ml-2 flex flex-1 sm:flex-none justify-between items-center gap-2 px-4 py-2 rounded-xl neu-active text-sm font-medium text-slate-300">
          All projects
          <Icon icon="solar:alt-arrow-down-linear" className="text-slate-500" width={16} />
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 touch-scroll-x min-h-[400px]">
        <div className="flex gap-4 md:gap-6 h-full min-w-max px-2 md:pr-8">

          {/* Column: Recurring */}
          <div className="w-[85vw] sm:w-80 flex-shrink-0 flex flex-col snap-start animate-slide-up stagger-1">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3a4354] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-black" />
                <h3 className="text-sm font-medium text-slate-300">Recurring</h3>
                <span className="text-xs text-slate-500 font-mono ml-1">0</span>
              </div>
              <button className="text-slate-600 hover:text-slate-400"><Icon icon="solar:add-linear" width={16} /></button>
            </div>
            <div className="flex-1 rounded-3xl neu-column p-3 flex flex-col gap-3 min-h-[300px]">
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic font-medium">no tasks</div>
            </div>
          </div>

          {/* Column: Backlog */}
          <div className="w-[85vw] sm:w-80 flex-shrink-0 flex flex-col snap-start animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-slate-600" />
                <h3 className="text-sm font-medium text-slate-300">Backlog</h3>
                <span className="text-xs text-slate-500 font-mono ml-1">{backlogTasks.length}</span>
              </div>
              <button className="text-slate-600 hover:text-slate-400"><Icon icon="solar:add-linear" width={16} /></button>
            </div>
            <div className="flex-1 rounded-3xl neu-column p-3 flex flex-col gap-3 overflow-y-auto">
              {backlogTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="w-[85vw] sm:w-80 flex-shrink-0 flex flex-col snap-start animate-slide-up stagger-3">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-blue-700" />
                <h3 className="text-sm font-medium text-slate-300">In Progress</h3>
                <span className="text-xs text-slate-500 font-mono ml-1">{inProgressTasks.length}</span>
              </div>
              <button className="text-slate-600 hover:text-slate-400"><Icon icon="solar:add-linear" width={16} /></button>
            </div>
            <div className="flex-1 rounded-3xl neu-column p-3 flex flex-col gap-3 overflow-y-auto">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Column: Done */}
          <div className="w-[85vw] sm:w-80 flex-shrink-0 flex flex-col snap-start animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-emerald-700" />
                <h3 className="text-sm font-medium text-slate-300">Done</h3>
                <span className="text-xs text-slate-500 font-mono ml-1">0</span>
              </div>
              <button className="text-slate-600 hover:text-slate-400"><Icon icon="solar:add-linear" width={16} /></button>
            </div>
            <div className="flex-1 rounded-3xl neu-column p-3 flex flex-col gap-3 min-h-[300px]">
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic font-medium">no tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
         HERMES INTEGRATION — Below kanban
         ========================================== */}
      <div className="px-2 space-y-6 animate-slide-up stagger-5">
        <SystemStatusWidget />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HermesGoalsWidget />
          <CronJobsWidget />
        </div>
        <MemoryStatusWidget />
      </div>
    </>
  );
}

// Task Card Component
function TaskCard({ task }: { task: { id: string; title: string; desc?: string; agent: string; agentColor: string; tag?: string; tagColor?: string; priority: string } }) {
  return (
    <div className="neu-card rounded-2xl p-4 cursor-grab hover:border-orange-500/30 transition-colors group">
      <div className="flex items-start gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
          task.priority === 'high' ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]' : 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]'
        }`} />
        <h4 className="text-sm font-medium text-slate-200 leading-tight">{task.title}</h4>
      </div>
      {task.desc && (
        <p className="text-xs text-slate-500 leading-relaxed mb-4 pl-3">{task.desc}</p>
      )}
      <div className="flex items-center justify-between pl-3">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full bg-[#1e222a] border border-[#333a47] flex items-center justify-center text-[9px] font-bold ${task.agentColor} shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]`}>
            {task.agent}
          </div>
          {task.tag && (
            <span className={`text-[10px] font-medium ${task.tagColor} drop-shadow-[0_0_2px_rgba(129,140,248,0.3)]`}>
              {task.tag}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-600">less than a minute ago</span>
      </div>
    </div>
  );
}
