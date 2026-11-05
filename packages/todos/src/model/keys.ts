import { queryOptions } from '@tanstack/react-query';
import type { Todo, UserId } from '@jtl/shared';
import { fetchTodosByAssignee } from '../api/todos-api';

/** A list row: either confirmed by the server or an optimistic placeholder. */
export type TodoRow = Todo & { pending?: true };

export const todoKeys = {
  all: ['todos'] as const,
  byAssignee: (assigneeId: UserId) =>
    [...todoKeys.all, 'assignee', assigneeId] as const,
  create: () => [...todoKeys.all, 'create'] as const,
};

export const todosByAssigneeQueryOptions = (assigneeId: UserId) =>
  queryOptions<TodoRow[]>({
    queryKey: todoKeys.byAssignee(assigneeId),
    queryFn: () => fetchTodosByAssignee(assigneeId),
  });
