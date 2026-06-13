import React from 'react';
import { Task, FilterType } from '../../types';
import { TaskItem } from './TaskItem';

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.time && b.time) return a.time < b.time ? -1 : 1;
    if (a.time) return -1;
    if (b.time) return 1;
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

function filterTasks(
  tasks: Task[],
  filter: FilterType,
  search: string,
  category: string
): Task[] {
  let result = [...tasks];

  switch (filter) {
    case 'incomplete':
      result = result.filter(t => !t.completed);
      break;
    case 'completed':
      result = result.filter(t => t.completed);
      break;
    case 'priority_high':
      result = result.filter(t => t.priority === 'high');
      break;
    case 'priority_medium':
      result = result.filter(t => t.priority === 'medium');
      break;
    case 'priority_low':
      result = result.filter(t => t.priority === 'low');
      break;
  }

  if (category) {
    result = result.filter(t => t.category === category);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  return sortTasks(result);
}

interface TaskListProps {
  tasks: Task[];
  filter?: FilterType;
  search?: string;
  categoryFilter?: string;
  emptyNode?: React.ReactNode;
}

export function TaskList({
  tasks,
  filter = 'all',
  search = '',
  categoryFilter = '',
  emptyNode,
}: TaskListProps) {
  const visible = filterTasks(tasks, filter, search, categoryFilter);

  if (visible.length === 0) {
    return emptyNode ? <>{emptyNode}</> : null;
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
