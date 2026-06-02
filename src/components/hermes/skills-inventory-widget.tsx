'use client';

import { useHermesStore } from '@/lib/store/hermes-store';
import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface SkillsInventoryWidgetProps {
  compact?: boolean;
}

export function SkillsInventoryWidget({ compact = true }: SkillsInventoryWidgetProps) {
  const skills = useHermesStore(s => s.skills);
  const skillsLoading = useHermesStore(s => s.skillsLoading);
  const fetchSkills = useHermesStore(s => s.fetchSkills);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Extract unique tags
  const allTags = useMemo(
    () => [...new Set(skills.flatMap((s) => s.tags || []))].sort(),
    [skills]
  );

  // Filter skills
  const filtered = useMemo(
    () => skills.filter((s) => {
      const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (s.tags || []).includes(selectedTag);
      return matchesSearch && matchesTag;
    }),
    [skills, searchQuery, selectedTag]
  );

  const displaySkills = useMemo(
    () => (compact ? filtered.slice(0, 8) : filtered),
    [compact, filtered]
  );
  const customCount = useMemo(
    () => skills.filter((s) => s.source === 'custom').length,
    [skills]
  );
  const bundledCount = useMemo(
    () => skills.filter((s) => s.source === 'bundled').length,
    [skills]
  );

  return (
    <div className="neu-card rounded-2xl p-4 md:p-5 hover:border-orange-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-300">Skills</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {skills.length} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono">
            {customCount} custom · {bundledCount} bundled
          </span>
          <button onClick={fetchSkills} className="text-slate-600 hover:text-orange-400 transition-colors">
            <Icon icon="solar:refresh-linear" width={14} className={skillsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <div className="flex h-9 rounded-xl neu-inset items-center px-3">
          <Icon icon="solar:magnifer-linear" className="text-slate-500 shrink-0" width={14} />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-300 placeholder-slate-600 ml-2 w-full font-medium"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allTags.slice(0, 8).map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={cn(
              'text-[10px] px-2 py-1 rounded-lg transition-colors',
              selectedTag === tag
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'bg-[#1a1d24] text-slate-500 border border-[#333a47]/30 hover:text-slate-300'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {skillsLoading && skills.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {displaySkills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0c0e12]/60 border border-black/30 hover:border-orange-500/20 transition-colors"
            >
              <div className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
                skill.source === 'custom'
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'bg-[#1a1d24] text-slate-500'
              )}>
                <Icon icon="solar:bolt-circle-linear" width={13} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-slate-300 truncate">{skill.name}</p>
                  {skill.hasCron && (
                    <Icon icon="solar:clock-circle-linear" className="text-indigo-400 shrink-0" width={10} />
                  )}
                </div>
                {skill.description && (
                  <p className="text-[10px] text-slate-600 truncate">{skill.description}</p>
                )}
                {skill.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {skill.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[9px] text-slate-600 bg-[#1a1d24] px-1 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {compact && filtered.length > 8 && (
        <p className="text-[10px] text-slate-600 mt-3 text-center">
          +{filtered.length - 8} more skills
        </p>
      )}
    </div>
  );
}
