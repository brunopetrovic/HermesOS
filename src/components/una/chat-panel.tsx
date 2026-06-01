'use client';

import { useUnaStore, UnaMessage, ApprovalQueueItem } from '@/lib/store/una-store';
import { ChatBubble } from './chat-bubble';
import { ApprovalPrompt } from './approval-prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

export function ChatPanel() {
  const {
    messages,
    isLoading,
    isThinking,
    approvalQueue,
    addMessage,
    setLoading,
    setThinking,
    updateApprovalStatus,
    setPanelOpen,
  } = useUnaStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    addMessage({
      role: 'user',
      content: userMessage,
    });

    setTimeout(() => {
      setThinking(true);

      setTimeout(() => {
        setThinking(false);

        const responses = [
          "I've noted that. I'll update your task list accordingly.",
          "Got it! I've scheduled that for you. Should I confirm the details?",
          "Interesting. I'm looking into that for you now.",
          "I've added that to your tasks. Let me know if you need anything else!",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        addMessage({
          role: 'assistant',
          content: randomResponse,
        });
        setLoading(false);
      }, 1500);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApprove = (id: string) => {
    updateApprovalStatus(id, 'approved');
    addMessage({
      role: 'assistant',
      content: 'Great! I\'ve completed that action for you.',
    });
  };

  const handleDeny = (id: string) => {
    updateApprovalStatus(id, 'denied');
    addMessage({
      role: 'assistant',
      content: 'No problem! I\'ve cancelled that action. Let me know if you\'d like to do something else.',
    });
  };

  const pendingApprovals = approvalQueue.filter((a: ApprovalQueueItem) => a.status === 'pending');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Mobile Bottom Sheet Panel */}
      <AnimatePresence>
        {isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
            />
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] h-[85vh] bg-bg-secondary border-t border-border flex flex-col rounded-t-[2rem]"
            >
              {/* Handle */}
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto my-3" />

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Icon icon="solar:sparkles-linear" className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary">Una</p>
                    <p className="text-xs text-success">Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-2 rounded-full bg-surface text-text-secondary hover:text-text-primary"
                >
                  <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                      <Icon icon="solar:chat-round-dots-linear" className="w-10 h-10 text-accent" />
                    </div>
                    <p className="text-lg font-bold text-text-primary mb-2">Welcome to Una</p>
                    <p className="text-sm text-text-secondary max-w-[250px]">
                      Your AI assistant ready to help manage your life operations.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message: UnaMessage) => (
                      <ChatBubble key={message.id} message={message} />
                    ))}

                    <AnimatePresence>
                      {pendingApprovals.map((approval: ApprovalQueueItem) => (
                        <ApprovalPrompt
                          key={approval.id}
                          id={approval.id}
                          action={approval.action}
                          details={approval.details}
                          tool_used={approval.tool_used}
                          onApprove={() => handleApprove(approval.id)}
                          onDeny={() => handleDeny(approval.id)}
                        />
                      ))}
                    </AnimatePresence>

                    {isThinking && (
                      <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <span>Una is thinking...</span>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border pb-safe">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Una..."
                    className="flex-1 h-12 text-base rounded-2xl"
                    disabled={isLoading}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    loading={isLoading}
                    className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center"
                  >
                    <Icon icon="solar:send-linear" className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Panel */}
      {!isMobile && (
        <aside className="fixed right-0 top-12 bottom-0 z-30 w-[320px] h-[calc(100vh-48px)] bg-bg-secondary border-l border-border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Icon icon="solar:sparkles-linear" className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Una</p>
                <p className="text-[10px] text-success">Online</p>
              </div>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1.5 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Icon icon="solar:close-circle-linear" className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Icon icon="solar:chat-round-dots-linear" className="w-8 h-8 text-accent" />
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">Welcome to Una</p>
                <p className="text-xs text-text-secondary max-w-[200px]">
                  Your AI assistant ready to help manage your life operations.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message: UnaMessage) => (
                  <ChatBubble key={message.id} message={message} />
                ))}

                <AnimatePresence>
                  {pendingApprovals.map((approval: ApprovalQueueItem) => (
                    <ApprovalPrompt
                      key={approval.id}
                      id={approval.id}
                      action={approval.action}
                      details={approval.details}
                      tool_used={approval.tool_used}
                      onApprove={() => handleApprove(approval.id)}
                      onDeny={() => handleDeny(approval.id)}
                    />
                  ))}
                </AnimatePresence>

                {isThinking && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    <span>Una is thinking...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Una..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                loading={isLoading}
                leftIcon={<Icon icon="solar:send-linear" className="w-3 h-3" />}
              >
                Send
              </Button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
