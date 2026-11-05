import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { createQueryClient, type UserId } from '@jtl/shared';
import {
  todoKeys,
  todosByAssigneeQueryOptions,
  useCreateTodo,
  type TodoRow,
} from '@jtl/todos';
import { db } from '../mocks/db';
import { server } from './setup';

const u1 = 'u1' as UserId;

test('two overlapping creates: the failing one rolls back alone, the other is kept and reconciled', async () => {
  const client = createQueryClient({ retry: false });
  await client.prefetchQuery(todosByAssigneeQueryOptions(u1));
  const invalidate = vi.spyOn(client, 'invalidateQueries');

  // A fails fast, B succeeds later: A settles while B is still in flight.
  server.use(
    http.post('/api/todos', async ({ request }) => {
      const body = (await request.json()) as {
        title: string;
        assigneeId: UserId;
      };
      if (body.title === 'A') {
        await delay(150);
        return HttpResponse.json({ message: 'boom' }, { status: 500 });
      }
      await delay(400);
      return HttpResponse.json(db.addTodo(body.title, body.assigneeId), {
        status: 201,
      });
    })
  );

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const a = renderHook(() => useCreateTodo(), { wrapper });
  const b = renderHook(() => useCreateTodo(), { wrapper });
  const rows = () =>
    client.getQueryData<TodoRow[]>(todoKeys.byAssignee(u1)) ?? [];

  act(() => {
    a.result.current.mutate({ title: 'A', assigneeId: u1 });
    b.result.current.mutate({ title: 'B', assigneeId: u1 });
  });

  // Both appear immediately as pending placeholders.
  await waitFor(
    () =>
      expect(
        rows()
          .filter((r) => r.pending)
          .map((r) => r.title)
      ).toEqual(['A', 'B']),
    { interval: 5 }
  );

  // A fails: only A is removed; B is still pending; no refetch yet (it would overwrite B).
  await waitFor(() => expect(a.result.current.isError).toBe(true));
  expect(rows().map((r) => r.title)).toEqual(['Review onboarding docs', 'B']);
  expect(rows().find((r) => r.title === 'B')?.pending).toBe(true);
  expect(invalidate).not.toHaveBeenCalled();

  // B succeeds: placeholder swapped for the server item, then one invalidation after the last settle.
  await waitFor(() => expect(b.result.current.isSuccess).toBe(true));
  await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(1));
  const b1 = rows().find((r) => r.title === 'B');
  expect(b1?.pending).toBeUndefined();
  expect(b1?.id).not.toMatch(/^temp-/);
  expect(rows().some((r) => r.title === 'A')).toBe(false);
});
