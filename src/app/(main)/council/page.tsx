'use client';

import { useCouncilStore } from '@/lib/store/council-store';
import { CouncilChat } from '@/components/council/council-chat';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { useShallow } from 'zustand/react/shallow';
import { useEffect } from 'react';
import { Agent } from '@/types';

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'una',
    name: 'Una',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=una',
    specialty: 'Main Orchestrator',
    description: 'Your primary agent who coordinates everything.'
  },
  {
    id: 'hermes-dev',
    name: 'Hermes Dev',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hermes-dev',
    specialty: 'Development',
    description: 'Expert in code review, architecture, and system operations.'
  },
  {
    id: 'hermes-research',
    name: 'Hermes Research',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hermes-research',
    specialty: 'Knowledge & Research',
    description: 'Specializes in information retrieval and synthesis.'
  }
];

export default function CouncilPage() {
  const { agents, setAgents } = useCouncilStore(
    useShallow(s => ({
      agents: s.agents,
      setAgents: s.setAgents,
    }))
  );

  useEffect(() => {
    if (agents.length === 0) {
      setAgents(INITIAL_AGENTS);
    }
  }, [agents.length, setAgents]);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)]">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full">
        {/* Sidebar: Agents List */}
        <div className="w-full lg:w-64 flex flex-col gap-3 md:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 px-2">
            <Icon icon="solar:users-group-rounded-linear" className="w-5 h-5 text-accent" />
            <h1 className="text-lg md:text-xl font-bold text-text-primary">Council</h1>
          </div>
          
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide">
            {agents.map((agent) => (
              <Card 
                key={agent.id}
                className="p-3 bg-surface border-border hover:border-accent/30 transition-colors cursor-pointer group flex-shrink-0 w-48 lg:w-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {agent.id === 'una' ? (
                      <Icon icon="solar:sparkles-linear" className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    ) : agent.id === 'hermes-dev' ? (
                      <Icon icon="solar:lightning-linear" className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    ) : (
                      <Icon icon="solar:shield-check-linear" className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{agent.name}</p>
                    <p className="text-[10px] text-accent uppercase tracking-wider">{agent.specialty}</p>
                  </div>
                </div>
              </Card>
            ))}
            
            <button className="flex items-center justify-center gap-2 p-3 rounded-[var(--radius-md)] border-2 border-dashed border-border text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all text-sm flex-shrink-0 w-48 lg:w-auto h-[58px] lg:h-auto">
              <Icon icon="solar:bot-linear" className="w-4 h-4" />
              <span>Add Agent</span>
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 min-w-0 h-full pb-20 md:pb-0">
          <CouncilChat />
        </div>
      </div>
    </div>
  );
}
