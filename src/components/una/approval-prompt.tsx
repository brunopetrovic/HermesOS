'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface ApprovalPromptProps {
  id: string;
  action: string;
  details: string;
  tool_used?: string[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

export function ApprovalPrompt({
  id,
  action,
  details,
  tool_used,
  onApprove,
  onDeny,
}: ApprovalPromptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const focusables = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onDeny(id);
      } else if (e.key === 'Tab') {
        const items = Array.from(focusables);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [id, onDeny]);

  return (
    <div
      ref={containerRef}
      role="alertdialog"
      aria-labelledby={`approval-action-${id}`}
      aria-describedby={`approval-details-${id}`}
      aria-label={`Approval request: ${action}`}
      className={cn(
        'p-3 rounded-[var(--radius-md)] bg-warning/10 border border-warning/30'
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <Icon icon="solar:danger-triangle-linear" className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p id={`approval-action-${id}`} className="text-sm font-medium text-warning">{action}</p>
          <p id={`approval-details-${id}`} className="text-xs text-text-secondary mt-0.5">{details}</p>
        </div>
      </div>

      {tool_used && tool_used.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3" aria-label="Tools used">
          {tool_used.map((tool, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-surface text-xs text-text-secondary"
            >
              {tool}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onApprove(id)}
          aria-label={`Approve ${action}`}
          leftIcon={<Icon icon="solar:check-circle-linear" className="w-3 h-3" />}
          className="flex-1 bg-success hover:bg-success/90"
        >
          Approve
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeny(id)}
          aria-label={`Deny ${action}`}
          leftIcon={<Icon icon="solar:close-circle-linear" className="w-3 h-3" />}
        >
          Deny
        </Button>
      </div>
    </div>
  );
}
