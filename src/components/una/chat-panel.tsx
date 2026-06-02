'use client';

import { useUnaStore, UnaMessage, ApprovalQueueItem } from '@/lib/store/una-store';
import { ChatBubble } from './chat-bubble';
import { ApprovalPrompt } from './approval-prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';

type StreamDelta = { choices?: Array<{ delta?: { content?: string } }> };
type StreamError = { error?: string };

function isStreamError(payload: StreamDelta | StreamError): payload is StreamError {
  return 'error' in payload;
}

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
  } = useUnaStore(
    useShallow(s => ({
      messages: s.messages,
      isLoading: s.isLoading,
      isThinking: s.isThinking,
      approvalQueue: s.approvalQueue,
      addMessage: s.addMessage,
      setLoading: s.setLoading,
      setThinking: s.setThinking,
      updateApprovalStatus: s.updateApprovalStatus,
      setPanelOpen: s.setPanelOpen,
    }))
  );

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const streamAssistantReply = useCallback(async (history: { role: 'user' | 'assistant' | 'system'; content: string }[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setThinking(true);
    addMessage({ role: 'assistant', content: '' });
    const replyId = useUnaStore.getState().messages[useUnaStore.getState().messages.length - 1]?.id;
    if (!replyId) return;

    try {
      const res = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'una-local',
          messages: history,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Stream failed (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 2);
          const line = chunk.replace(/^data:\s*/, '').trim();
          if (!line || line === '[DONE]') continue;

          try {
            const payload = JSON.parse(line) as StreamDelta | StreamError;
            if (isStreamError(payload) && payload.error) {
              throw new Error(payload.error);
            }
            if (!isStreamError(payload)) {
              const delta = payload.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                const finalText = accumulated;
                useUnaStore.setState((state) => ({
                  messages: state.messages.map((m: UnaMessage) => (m.id === replyId ? { ...m, content: finalText } : m)),
                }));
              }
            }
          } catch (parseError) {
            if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
              console.warn('Stream parse warning:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      const message = error instanceof Error ? error.message : 'Stream failed';
      useUnaStore.setState((state) => ({
        messages: state.messages.map((m: UnaMessage) =>
          m.id === replyId
            ? { ...m, content: m.content || `Sorry — I couldn\'t reach the agent gateway (${message}).` }
            : m
        ),
      }));
    } finally {
      setThinking(false);
    }
  }, [addMessage, setThinking]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    addMessage({ role: 'user', content: userMessage });

    const history = [
      ...useUnaStore.getState().messages.map((m: UnaMessage) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    setLoading(false);
    await streamAssistantReply(history);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApprove = (id: string) => {
    updateApprovalStatus(id, 'approved');
    addMessage({ role: 'assistant', content: "Great! I've completed that action for you." });
  };

  const handleDeny = (id: string) => {
    updateApprovalStatus(id, 'denied');
    addMessage({ role: 'assistant', content: "No problem! I've cancelled that action. Let me know if you'd like to do something else." });
  };

  const pendingApprovals = approvalQueue.filter((a: ApprovalQueueItem) => a.status === 'pending');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
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
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto my-3" />

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
                  aria-label="Close chat"
                >
                  <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                </button>
              </div>

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

      {!isMobile && (
        <aside className="fixed right-0 top-12 bottom-0 z-30 w-[320px] h-[calc(100vh-48px)] bg-bg-secondary border-l border-border flex flex-col">
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
              aria-label="Close chat"
            >
              <Icon icon="solar:close-circle-linear" className="w-4 h-4" />
            </button>
          </div>

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
