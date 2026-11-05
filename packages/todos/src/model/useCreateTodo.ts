import { useMutation } from '@tanstack/react-query';
import type { CreateTodoInput } from '@jtl/shared';
import { createTodo } from '../api/todos-api';
import { todoKeys, type TodoRow } from './keys';
import { insertPending, removeById, replaceById } from './optimistic';

/**
 * Optimistic create with per-item rollback.
 * - onMutate: cancel in-flight fetches of the target list, insert a placeholder with a temp id.
 * - onError: remove only that temp id. A whole-list snapshot restore would also wipe other
 *   creates that are still pending.
 * - onSuccess: swap the placeholder for the server item in place (no flicker).
 * - onSettled: invalidate only when this is the last create in flight. In the useMutation
 *   options onSettled the settling mutation is still counted, so "last" is === 1
 *   (verified on @tanstack/query-core 5.105.3; guarded by the overlapping-create test).
 */
export function useCreateTodo() {
  const mutationKey = todoKeys.create();
  return useMutation({
    mutationKey,
    mutationFn: createTodo,
    onMutate: async (
      input: CreateTodoInput & { index?: number },
      { client }
    ) => {
      const key = todoKeys.byAssignee(input.assigneeId);
      await client.cancelQueries({ queryKey: key });
      const tempId = `temp-${crypto.randomUUID()}`;
      const row: TodoRow = {
        id: tempId,
        title: input.title,
        assigneeId: input.assigneeId,
        done: false,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      client.setQueryData<TodoRow[]>(key, (rows) =>
        insertPending(rows, row, input.index)
      );
      return { key, tempId };
    },
    onError: (_err, _input, result, { client }) => {
      if (result)
        client.setQueryData<TodoRow[]>(result.key, (rows) =>
          removeById(rows, result.tempId)
        );
    },
    onSuccess: (todo, _input, result, { client }) => {
      client.setQueryData<TodoRow[]>(result.key, (rows) =>
        replaceById(rows, result.tempId, todo)
      );
    },
    onSettled: (_data, _err, _input, _result, { client }) => {
      if (client.isMutating({ mutationKey }) === 1) {
        return client.invalidateQueries({ queryKey: todoKeys.all });
      }
    },
  });
}
