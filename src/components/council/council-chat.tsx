'use client';

import { useCouncilStore } from '@/lib/store/council-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState, useRef, useEffect } from 'react';
import { Agent } from '@/types';

export function CouncilChat() {
  const { messages, agents, isLoading, addMessage, setLoading } = useCouncilStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Simulate multi-agent responses
    setTimeout(() => {
      // 1. Una responds first
      addMessage({
        role: 'assistant',
        agentId: 'una',
        content: `I've received your request: "${userMessage}". Hermes Dev, Hermes Research, what are your thoughts?`,
      });

      setTimeout(() => {
        // 2. Hermes Dev responds
        addMessage({
          role: 'assistant',
          agentId: 'hermes-dev',
          content: "I'm analyzing the technical requirements for this. We can implement a robust solution using the current architecture.",
        });

        setTimeout(() => {
          // 3. Hermes Research responds
          addMessage({
            role: 'assistant',
            agentId: 'hermes-research',
            content: "I've cross-referenced our knowledge base. Similar tasks in the past were optimized by prioritizing the sync layer.",
          });
          setLoading(false);
        }, 1200);
      }, 1000);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgent = (agentId?: string): Agent | undefined => {
    if (!agentId) return undefined;
    return agents.find(a => a.id === agentId);
  };

  return (
    <Card className="flex flex-col h-full bg-surface border-border overflow-hidden shadow-2xl">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Icon icon="solar:chat-round-dots-linear" className="w-8 h-8 text-accent" />
            </div>
            <p className="text-lg font-medium text-text-primary">Start a Council Session</p>
            <p className="text-sm text-text-secondary max-w-xs">
              All active agents will participate in the conversation to help you solve complex problems.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const agent = getAgent(message.agentId);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col gap-2",
                    isUser ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2 mb-1",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                      isUser ? "bg-accent/20 text-accent" : "bg-surface border border-border"
                    )}>
                      {isUser ? <Icon icon="solar:user-linear" className="w-3 h-3" /> : (
                        message.agentId === 'una' ? <Icon icon="solar:sparkles-linear" className="w-3 h-3 text-accent" /> :
                        message.agentId === 'hermes-dev' ? <Icon icon="solar:lightning-linear" className="w-3 h-3 text-accent" /> :
                        <Icon icon="solar:shield-check-linear" className="w-3 h-3 text-accent" />
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-tighter text-text-secondary font-bold">
                      {isUser ? "YOU" : (agent?.name || "AGENT").toUpperCase()}
                    </span>
                    <span className="text-[10px] text-text-secondary opacity-50">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] md:max-w-[75%]",
                    isUser 
                      ? "bg-accent text-bg-primary rounded-tr-none shadow-lg shadow-accent/20" 
                      : "bg-bg-secondary border border-border text-text-primary rounded-tl-none"
                  )}>
                    {message.content}
                  </div>
                </motion.div>
              );
            })}
            
            {isLoading && (
              <div className="flex items-center gap-3 text-text-secondary text-xs animate-pulse italic">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>The Council is deliberating...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-bg-secondary/50 border-t border-border">
        <div className="flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Address the Council..."
            className="flex-1 bg-surface border-border focus:border-accent/50 focus:ring-accent/20 transition-all h-12"
            disabled={isLoading}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="w-12 h-12 rounded-xl"
          >
            <Icon icon="solar:send-linear" className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
