import { useMutation } from '@tanstack/react-query';
import { deleteTodo, updateTodo } from '../api/todos-api';
import { todoKeys, type TodoRow } from './keys';
import { patchById, removeById, restoreAt } from './optimistic';

// Same pattern as create: change one row optimistically, undo only that row on error,
// invalidate once the last write of this kind settles (isMutating === 1 in options onSettled).

export function useToggleTodo() {
  const mutationKey = [...todoKeys.all, 'toggle'] as const;
  return useMutation({
    mutationKey,
    mutationFn: (todo: TodoRow) => updateTodo(todo.id, { done: !todo.done }),
    onMutate: async (todo, { client }) => {
      const key = todoKeys.byAssignee(todo.assigneeId);
      await client.cancelQueries({ queryKey: key });
      client.setQueryData<TodoRow[]>(key, (rows) =>
        patchById(rows, todo.id, { done: !todo.done })
      );
      return { key, id: todo.id, previousDone: todo.done };
    },
    onError: (_e, _todo, r, { client }) => {
      if (r)
        client.setQueryData<TodoRow[]>(r.key, (rows) =>
          patchById(rows, r.id, { done: r.previousDone })
        );
    },
    onSettled: (_d, _e, _v, _r, { client }) => {
      if (client.isMutating({ mutationKey }) === 1)
        return client.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}

export function useDeleteTodo() {
  const mutationKey = [...todoKeys.all, 'delete'] as const;
  return useMutation({
    mutationKey,
    mutationFn: (todo: TodoRow) => deleteTodo(todo.id),
    onMutate: async (todo, { client }) => {
      const key = todoKeys.byAssignee(todo.assigneeId);
      await client.cancelQueries({ queryKey: key });
      const index =
        client
          .getQueryData<TodoRow[]>(key)
          ?.findIndex((r) => r.id === todo.id) ?? -1;
      client.setQueryData<TodoRow[]>(key, (rows) => removeById(rows, todo.id));
      return { key, row: todo, index: Math.max(index, 0) };
    },
    onError: (_e, _todo, r, { client }) => {
      if (r)
        client.setQueryData<TodoRow[]>(r.key, (rows) =>
          restoreAt(rows, r.row, r.index)
        );
    },
    onSettled: (_d, _e, _v, _r, { client }) => {
      if (client.isMutating({ mutationKey }) === 1)
        return client.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
}
