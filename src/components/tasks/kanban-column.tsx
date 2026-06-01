'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Task, KanbanColumn as KanbanColumnType } from '@/types';
import { TaskCard } from './task-card';
import { Icon } from '@iconify/react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: Task[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="flex flex-col w-[280px] min-w-[280px] bg-secondary/30 rounded-xl border border-border/50 p-2 h-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-text-primary uppercase tracking-wider">
            {column.title}
          </h3>
          <span className="text-[10px] bg-surface border border-border px-1.5 rounded-full text-text-secondary">
            {tasks.length}
          </span>
        </div>
        <button className="text-text-secondary hover:text-text-primary hover:bg-surface p-1 rounded transition-colors">
          <Icon icon="solar:add-circle-linear" width={16} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto px-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/40 rounded-xl opacity-40">
            <p className="text-xs text-text-secondary">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
