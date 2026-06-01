'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Task, KanbanColumn as KanbanColumnType } from '@/types';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: string) => void;
}

export function KanbanBoard({ columns, tasks, onTaskMove }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      const activeIndex = localTasks.findIndex((t) => t.id === activeId);
      const overIndex = localTasks.findIndex((t) => t.id === overId);

      if (localTasks[activeIndex].status !== localTasks[overIndex].status) {
        const updatedTasks = [...localTasks];
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          status: localTasks[overIndex].status,
        };
        setLocalTasks(arrayMove(updatedTasks, activeIndex, overIndex));
      } else {
        setLocalTasks(arrayMove(localTasks, activeIndex, overIndex));
      }
    }

    // Dropping a task over a column
    if (isActiveATask && isOverAColumn) {
      const activeIndex = localTasks.findIndex((t) => t.id === activeId);
      const newStatus = over.data.current?.column.status;

      if (localTasks[activeIndex].status !== newStatus) {
        const updatedTasks = [...localTasks];
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          status: newStatus,
        };
        setLocalTasks(arrayMove(updatedTasks, activeIndex, activeIndex));
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;

    const task = localTasks.find(t => t.id === taskId);
    if (task && onTaskMove) {
      onTaskMove(taskId, task.status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 md:gap-4 lg:gap-6 p-2 md:p-4 h-full overflow-x-auto min-h-[calc(100vh-250px)] pb-10 custom-scrollbar">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={localTasks.filter((t) => t.status === col.status)}
          />
        ))}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
