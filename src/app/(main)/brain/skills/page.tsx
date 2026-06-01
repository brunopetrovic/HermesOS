'use client';

import { Icon } from '@iconify/react';
import { useHermesStore } from '@/lib/store/hermes-store';
import { useEffect } from 'react';

export default function BrainSkillsPage() {
  const { skills, skillsStats, skillsLoading, fetchSkills } = useHermesStore();

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  return (
    <>
      <div className="flex items-center gap-3 px-2 animate-slide-up stagger-1">
        <Icon icon="solar:widget-linear" className="text-orange-500 glow-orange" width={22} />
        <div>
          <h1 className="text-lg font-medium text-slate-200">Skills Library</h1>
          <p className="text-xs text-slate-500">{skillsStats.total} skills installed · {skillsStats.custom} custom</p>
        </div>
      </div>

      <div className="px-2 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up stagger-2">
        {[
          { label: 'Total', value: skillsStats.total, color: 'text-orange-400' },
          { label: 'Custom', value: skillsStats.custom, color: 'text-emerald-400' },
          { label: 'Bundled', value: skillsStats.bundled, color: 'text-sky-400' },
          { label: 'Cron-Linked', value: skillsStats.cronLinked, color: 'text-violet-400' },
        ].map((stat) => (
          <div key={stat.label} className="neu-card rounded-xl p-4">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className={`text-xl font-light ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="px-2 space-y-3 animate-slide-up stagger-3">
        {skillsLoading ? (
          <div className="text-center py-8"><p className="text-sm text-slate-500">Loading skills...</p></div>
        ) : skills.length === 0 ? (
          <div className="text-center py-8"><p className="text-sm text-slate-500">No skills found</p></div>
        ) : (
          skills.map((skill) => (
            <div key={skill.name} className="neu-card rounded-2xl p-4 hover:border-orange-500/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0c0e12] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)] border border-black flex items-center justify-center shrink-0">
                  <Icon icon="solar:widget-linear" className={skill.source === 'custom' ? 'text-emerald-400' : 'text-sky-400'} width={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-200">{skill.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      skill.source === 'custom' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>{skill.source}</span>
                    {skill.deprecated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">deprecated</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{skill.description}</p>
                  {skill.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {skill.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1d24] text-slate-500 border border-[#333a47]/20">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
