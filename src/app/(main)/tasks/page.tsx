'use client';

import { useState, useMemo } from 'react';
import { useInstanceStore } from '@/lib/store/instance-store';
import { INSTANCE_CONFIGS, Task, TaskStatus } from '@/types';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { getRealmFromPathname } from '@/lib/realm';
import { usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';

const CalendarView = dynamic(
  () => import('@/components/calendar/calendar-view').then(m => m.CalendarView),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-[#161920] rounded-xl animate-pulse" />
  }
);

type ViewMode = 'kanban' | 'list' | 'calendar' | 'table' | 'timeline' | 'gantt' | 'cards';
const TASK_VIEW_MODES: ViewMode[] = ['kanban', 'list', 'calendar', 'table', 'timeline', 'gantt', 'cards'];

function getInitialTaskView(): ViewMode {
  if (typeof window === 'undefined') return 'kanban';
  const view = new URLSearchParams(window.location.search).get('view') as ViewMode | null;
  return view && TASK_VIEW_MODES.includes(view) ? view : 'kanban';
}

type ApiTask = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  column?: string;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  instance?: { key: 'personal' | 'brand' | 'business' };
};

type SyncResponse = { tasks?: ApiTask[] };

function toTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    status: (t.status || 'todo') as TaskStatus,
    priority: (t.priority || 'medium') as Task['priority'],
    instance: (t.instance?.key || 'personal') as Task['instance'],
    dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
    completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  };
}

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/sync/pull', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sync pull failed (HTTP ${res.status})`);
  const data = (await res.json()) as SyncResponse;
  return (data.tasks || []).map(toTask);
}

export default function TasksPage() {
  const { currentInstance } = useInstanceStore();
  const pathname = usePathname();
  const realm = getRealmFromPathname(pathname);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialTaskView);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const moveTask = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tasks',
          data: [{
            id: task.id,
            title: task.title,
            description: task.description,
            status: newStatus,
            priority: task.priority,
            instance: task.instance,
            dueDate: task.dueDate?.toISOString(),
          }],
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleTaskMove = (taskId: string, newStatus: string) => {
    moveTask.mutate({ taskId, newStatus });
  };

  const instanceConfig = INSTANCE_CONFIGS[currentInstance];
  const columns = instanceConfig.kanbanColumns;

  const calendarEvents = useMemo(
    () => tasks
      .filter((t) => t.instance === realm || t.instance === currentInstance)
      .map((t) => ({
        id: t.id,
        title: t.title,
        startDate: t.dueDate || t.createdAt,
        endDate: t.dueDate || t.createdAt,
        allDay: true,
        instance: t.instance,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    [tasks, currentInstance, realm]
  );

  return (
    <div className="space-y-4 md:space-y-6 flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary text-xs md:text-sm">Manage your {instanceConfig.label} tasks</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Icon icon="solar:search-linear" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 w-full sm:w-48 lg:w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 sm:flex-initial flex items-center gap-1 p-1 bg-surface border border-border rounded-xl overflow-x-auto scrollbar-hide">
              <ViewButton mode="kanban" current={viewMode} onClick={setViewMode} icon={<Icon icon="solar:grid-linear" className="w-4 h-4" />} label="Kanban" />
              <ViewButton mode="list" current={viewMode} onClick={setViewMode} icon={<Icon icon="solar:list-linear" className="w-4 h-4" />} label="List" />
              <ViewButton mode="calendar" current={viewMode} onClick={setViewMode} icon={<Icon icon="solar:calendar-linear" className="w-4 h-4" />} label="Calendar" />
              <ViewButton mode="table" current={viewMode} onClick={setViewMode} icon={<Icon icon="solar:table-linear" className="w-4 h-4" />} label="Table" />
            </div>

            <button className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-accent text-bg-primary rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95 flex-shrink-0">
              <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Tasks could not sync"
          detail={(error as Error).message}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
        />
      )}

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 md:pr-2 custom-scrollbar pb-10 md:pb-0">
        {isLoading ? (
          <LoadingState title="Syncing tasks" detail="Pulling the latest task mirror from the local workspace." />
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            columns={columns}
            tasks={tasks.filter((t) => t.instance === currentInstance)}
            onTaskMove={handleTaskMove}
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {tasks.filter((t) => t.instance === currentInstance).map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
            {tasks.filter((t) => t.instance === currentInstance).length === 0 && (
              <EmptyState
                icon="solar:clipboard-list-linear"
                title="No tasks for this realm yet"
                detail="Create a task manually or ask Una to turn a goal into executable work once your agent is connected."
              />
            )}
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView events={calendarEvents.filter((e) => e.instance === currentInstance)} />
        ) : (
          <Card className="flex flex-col items-center justify-center py-20 bg-surface border-border border-dashed">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              {viewMode === 'table' ? <Icon icon="solar:table-linear" className="w-8 h-8 text-accent" /> :
               viewMode === 'timeline' ? <Icon icon="solar:clock-circle-linear" className="w-8 h-8 text-accent" /> :
               viewMode === 'gantt' ? <Icon icon="solar:chart-line-linear" className="w-8 h-8 text-accent" /> :
               <Icon icon="solar:credit-card-linear" className="w-8 h-8 text-accent" />}
            </div>
            <h3 className="text-lg font-bold text-text-primary capitalize">{viewMode} View</h3>
            <p className="text-sm text-text-secondary max-w-xs text-center mt-2">
              This specialized view is under development and will be available in the next release.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function ViewButton({ mode, current, onClick, icon, label }: { mode: ViewMode, current: ViewMode, onClick: (m: ViewMode) => void, icon: React.ReactNode, label: string }) {
  const isActive = mode === current;
  return (
    <button
      onClick={() => onClick(mode)}
      className={cn(
        'p-2 rounded-lg transition-all flex items-center gap-2 group',
        isActive
          ? 'bg-accent text-bg-primary shadow-lg shadow-accent/20'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
      )}
      title={label}
    >
      {icon}
      {isActive && <span className="text-xs font-bold hidden xl:inline pr-1">{label}</span>}
    </button>
  );
}

function TaskListItem({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-accent/30 transition-all group">
      <div className="w-5 h-5 rounded border-2 border-border group-hover:border-accent/50 cursor-pointer" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{task.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="default" size="sm" className="capitalize text-[10px] py-0">{task.status.replace('_', ' ')}</Badge>
          {task.dueDate && (
            <span className="text-[10px] text-text-secondary flex items-center gap-1">
              <Icon icon="solar:clock-circle-linear" className="w-3 h-3" />
              {task.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <Badge
        variant={task.priority === 'urgent' || task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}
        size="sm"
        className="hidden sm:inline-flex"
      >
        {task.priority}
      </Badge>
    </div>
  );
}
