'use client';

import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { UnaMessage as UnaMessageType } from '@/lib/store/una-store';

interface ChatBubbleProps {
  message: UnaMessageType;
  showAvatar?: boolean;
}

export function ChatBubble({ message, showAvatar = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-3 py-1.5 rounded-full bg-surface/50 border border-border text-xs text-text-secondary">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex gap-2 my-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={cn(
            'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center',
            isUser ? 'bg-accent/20' : 'bg-surface border border-border'
          )}
        >
          {isUser ? (
            <Icon icon="solar:user-linear" className="w-3.5 h-3.5 text-accent" />
          ) : (
            <Icon icon="solar:bot-linear" className="w-3.5 h-3.5 text-accent" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] md:max-w-[70%] lg:max-w-[60%] px-3 py-2.5 rounded-[var(--radius-md)] text-sm leading-relaxed',
          isUser
            ? 'bg-accent text-bg-primary rounded-tr-[4px]'
            : 'bg-surface border border-border text-text-primary rounded-tl-[4px]'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser ? 'text-bg-primary/60' : 'text-text-secondary'
          )}
        >
          {formatTime(message.timestamp)}
        </p>

        {/* Approval indicator */}
        {message.approvalNeeded && (
          <div className="mt-2 p-2 rounded-[var(--radius-sm)] bg-warning/10 border border-warning/30">
            <div className="flex items-center gap-1.5 text-warning text-xs font-medium">
              <Icon icon="solar:danger-circle-linear" className="w-3 h-3" />
              <span>Approval Required</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {message.approvalNeeded.action}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
